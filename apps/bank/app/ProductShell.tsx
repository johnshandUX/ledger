import {
  AppShell,
  AppWorkspace,
  OrganisationSwitcher,
  SideNav,
  SideNavContext,
  SideNavGroup,
  SideNavHeader,
  SideNavItem,
  SideNavNavigation,
  SideNavUser,
  SideNavUtility,
  UserMenu,
  UserMenuItem,
  WorkspaceHeader,
} from "@johnshandux/ledger-design-system/application-navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { BANK_BUSINESS_ID, BANK_BUSINESS_NAME } from "../src/finance/environment";
import { getBankDemoUser, getBankRolesForUser } from "../src/finance/users";
import { ThemeControl } from "./ThemeControl";
import "./ProductShell.css";

export type BankNavigationRoute = "accounts" | "payments" | "reporting";

type ProductShellProps = {
  activeRoute: BankNavigationRoute;
  children: ReactNode;
};

export const bankNavigation = [
  { id: "accounts", label: "Accounts", href: "/" },
  { id: "payments", label: "Payments", href: "/payments" },
  { id: "reporting", label: "Reporting" },
] as const;

const workspaceTitles: Record<BankNavigationRoute, string> = {
  accounts: "Accounts",
  payments: "Payments",
  reporting: "Reporting",
};

export function ProductShell({ activeRoute, children }: ProductShellProps) {
  const activeUser = getBankDemoUser();
  const activeRole = getBankRolesForUser(activeUser.id)[0];
  const displayName = `${activeUser.firstName} ${activeUser.lastName}`;

  const navigation = (
    <SideNav>
      <SideNavHeader>
        <Link href="/" className="bank-product-name">Ledger Bank</Link>
      </SideNavHeader>
      <SideNavContext>
        <OrganisationSwitcher
          organisations={[{ id: BANK_BUSINESS_ID, name: BANK_BUSINESS_NAME }]}
          selectedId={BANK_BUSINESS_ID}
        />
      </SideNavContext>
      <SideNavNavigation label="Primary">
        <SideNavGroup>
          {bankNavigation.map((route) =>
            "href" in route ? (
              <SideNavItem key={route.id} asChild current={activeRoute === route.id}>
                <Link href={route.href}>{route.label}</Link>
              </SideNavItem>
            ) : (
              <span
                key={route.id}
                className="ledger-side-nav-item bank-navigation-item--unavailable"
                aria-disabled="true"
                title="Reporting is not yet available"
              >
                {route.label}
              </span>
            ),
          )}
        </SideNavGroup>
      </SideNavNavigation>
      <SideNavUtility>
        <div className="bank-navigation-appearance">
          <span>Appearance</span>
          <ThemeControl />
        </div>
      </SideNavUtility>
      <SideNavUser>
        <UserMenu displayName={displayName} secondaryText={activeRole?.name}>
          <UserMenuItem disabled>Personal preferences</UserMenuItem>
          <UserMenuItem disabled>Sign out</UserMenuItem>
        </UserMenu>
      </SideNavUser>
    </SideNav>
  );

  return (
    <AppShell className="product-shell" navigation={navigation}>
      <WorkspaceHeader>
        <span className="bank-workspace-title">{workspaceTitles[activeRoute]}</span>
      </WorkspaceHeader>
      <AppWorkspace className="bank-workspace">{children}</AppWorkspace>
    </AppShell>
  );
}
