import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AppShell,
  AppWorkspace,
  getInitials,
  OrganisationSwitcher,
  SideNav,
  SideNavGroup,
  SideNavItem,
  SideNavNavigation,
  UserMenu,
  UserMenuItem,
  WorkspaceHeader,
} from "./ApplicationNavigation";

describe("ApplicationNavigation", () => {
  it("communicates the current destination with link and page semantics", () => {
    const html = renderToStaticMarkup(
      <AppShell navigation={<SideNav><SideNavNavigation><SideNavItem href="/reports" current>Reports</SideNavItem></SideNavNavigation></SideNav>}>
        <WorkspaceHeader>Reports</WorkspaceHeader><AppWorkspace>Workspace</AppWorkspace>
      </AppShell>,
    );
    expect(html).toContain('<a href="/reports" aria-current="page"');
    expect(html).toContain('<nav aria-label="Primary"');
  });

  it("removes closed desktop navigation from layout and interaction", () => {
    const html = renderToStaticMarkup(<AppShell defaultNavigationOpen={false} navigation={<SideNav><SideNavNavigation><SideNavItem href="/one">One</SideNavItem></SideNavNavigation></SideNav>}><WorkspaceHeader>Workspace</WorkspaceHeader><AppWorkspace>Content</AppWorkspace></AppShell>);
    const css = readFileSync(new URL("./ApplicationNavigation.css", import.meta.url), "utf8");
    expect(html).toContain('data-navigation-open="false"');
    expect(html).toContain('data-navigation-mode="inline"');
    expect(html).toContain('aria-hidden="true" inert=""');
    expect(html).toContain('aria-label="Show navigation"');
    expect(html).not.toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('aria-expanded=');
    expect(css).toMatch(/grid-template-columns:\s*0 minmax\(0, 1fr\)/);
    expect(css).toMatch(/ledger-navigation-control--show/);
  });

  it("retains the reduced-motion and narrow overlay contracts", () => {
    const css = readFileSync(new URL("./ApplicationNavigation.css", import.meta.url), "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (max-width: 740px)");
    expect(css).toMatch(/ledger-app-shell__navigation \{ display: none; \}/);
    expect(css).toMatch(/ledger-side-nav-item \{ min-height: var\(--ledger-space-7\);/);
  });

  it("uses the compact desktop density and aligned header contracts", () => {
    const css = readFileSync(new URL("./ApplicationNavigation.css", import.meta.url), "utf8");
    expect(css).toMatch(/ledger-workspace-header \{[^}]*box-sizing: border-box;[^}]*height: calc\(var\(--ledger-space-8\) \+ var\(--ledger-space-2\)\)/);
    expect(css).toMatch(/ledger-side-nav__header \{[^}]*box-sizing: border-box;[^}]*height: calc\(var\(--ledger-space-8\) \+ var\(--ledger-space-2\)\)/);
    expect(css).toMatch(/ledger-side-nav-item \{[^}]*box-sizing: border-box;[^}]*min-height: calc\(var\(--ledger-space-7\) - var\(--ledger-space-1\)\)/);
    expect(css).toMatch(/ledger-side-nav-item:hover \{[^}]*background: var\(--ledger-color-surface-elevated\)/);
    expect(css).toMatch(/ledger-side-nav-group__heading \{[^}]*color: var\(--ledger-color-text-tertiary\);[^}]*font-size: var\(--ledger-font-size-small\);[^}]*line-height: var\(--ledger-line-height-small\)/);
  });

  it("can pass navigation semantics to a routing-library link", () => {
    const html = renderToStaticMarkup(<AppShell navigation={<SideNav><SideNavNavigation><SideNavItem asChild current><a href="/activity">Activity</a></SideNavItem></SideNavNavigation></SideNav>}><WorkspaceHeader>Activity</WorkspaceHeader></AppShell>);
    expect(html).toContain('<a href="/activity" aria-current="page"');
    expect(html).toContain("ledger-side-nav-item");
  });

  it("uses a labelled section for grouped destinations", () => {
    const html = renderToStaticMarkup(<AppShell navigation={<SideNav><SideNavNavigation><SideNavGroup label="Planning"><SideNavItem href="/forecast">Forecast</SideNavItem></SideNavGroup></SideNavNavigation></SideNav>}><WorkspaceHeader>Forecast</WorkspaceHeader></AppShell>);
    expect(html).toMatch(/<section aria-labelledby="[^"]+"/);
    expect(html).toContain("<h2");
  });

  it("renders an unlabelled primary group without an empty heading or labelled-section gap", () => {
    const html = renderToStaticMarkup(<AppShell navigation={<SideNav><SideNavNavigation><SideNavGroup><SideNavItem href="/accounts">Accounts</SideNavItem></SideNavGroup></SideNavNavigation></SideNav>}><WorkspaceHeader>Accounts</WorkspaceHeader></AppShell>);
    expect(html).toContain("Accounts");
    expect(html).not.toContain("<h2");
    expect(html).not.toContain("aria-labelledby");
  });

  it("composes distinct product configurations without product-specific components", () => {
    const renderGroups = (groups: readonly { label: string; items: readonly string[] }[]) => groups.map((group) => <SideNavGroup key={group.label} label={group.label}>{group.items.map((item) => <SideNavItem key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>{item}</SideNavItem>)}</SideNavGroup>);
    const bank = renderToStaticMarkup(<AppShell navigation={<SideNav><SideNavNavigation>{renderGroups([{ label: "Treasury", items: ["Cash flow", "FX"] }])}</SideNavNavigation></SideNav>}><WorkspaceHeader>Accounts</WorkspaceHeader></AppShell>);
    const accounting = renderToStaticMarkup(<AppShell navigation={<SideNav><SideNavNavigation>{renderGroups([{ label: "Accounting", items: ["Chart of accounts", "Journals"] }])}</SideNavNavigation></SideNav>}><WorkspaceHeader>Dashboard</WorkspaceHeader></AppShell>);
    expect(bank).toContain("Treasury");
    expect(bank).toContain("Cash flow");
    expect(accounting).toContain("Accounting");
    expect(accounting).toContain("Chart of accounts");
  });

  it("renders a single organisation without an unnecessary menu", () => {
    const html = renderToStaticMarkup(<OrganisationSwitcher organisations={[{ id: "one", name: "One organisation" }]} selectedId="one" />);
    expect(html).toContain("One organisation");
    expect(html).not.toContain('aria-haspopup="menu"');
  });

  it("exposes organisation and user menu triggers", () => {
    const organisation = renderToStaticMarkup(<OrganisationSwitcher organisations={[{ id: "one", name: "One" }, { id: "two", name: "Two" }]} selectedId="one" />);
    const user = renderToStaticMarkup(<UserMenu displayName="Ada Lovelace" secondaryText="Administrator"><UserMenuItem>Preferences</UserMenuItem></UserMenu>);
    expect(organisation).toContain('aria-haspopup="menu"');
    expect(user).toContain('aria-haspopup="menu"');
  });

  it("derives initials from the first two name parts", () => {
    expect(getInitials("  Ada   Lovelace Byron ")).toBe("AL");
    expect(getInitials("Plato")).toBe("P");
    expect(getInitials("李 雷")).toBe("李雷");
    expect(getInitials("   ")).toBe("");
  });

  it("rejects a selected organisation that is not supplied", () => {
    expect(() => renderToStaticMarkup(<OrganisationSwitcher organisations={[]} selectedId="missing" />)).toThrow(/selectedId/);
  });
});
