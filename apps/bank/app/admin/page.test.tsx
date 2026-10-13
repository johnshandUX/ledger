import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../BankStateProvider";
import { administrationDestinations } from "./AdminAreaNavigation";
import AdminPage from "./page";

const renderPage = () => renderToStaticMarkup(
  <BankStateProvider><AdminPage /></BankStateProvider>,
);

describe("Administration home", () => {
  it("renders the dashboard in the agreed hierarchy with every destination", () => {
    const html = renderPage();
    expect(html).toContain('<div class="admin-page">');
    expect(html).toContain('<h1 id="admin-page-title">Administration</h1>');
    expect(html).toContain("Caldermere Ltd");
    expect(html).toContain('<nav class="admin-navigation" aria-label="Administration">');
    for (const destination of Object.values(administrationDestinations)) {
      expect(html).toContain(`href="${destination.href}"`);
    }
    for (const heading of [
      "Total users", "Access requests", "Mobile app users", "Needs your attention",
      "Recent activity", "Billing", "Quick access",
    ]) {
      expect(html).toContain(heading);
    }
    const orderedSections = [
      "admin-summary", "admin-attention", "admin-detail-grid", "admin-quick-access",
    ];
    let previousIndex = -1;
    for (const section of orderedSections) {
      const index = html.indexOf(section);
      expect(index).toBeGreaterThan(previousIndex);
      previousIndex = index;
    }
  });

  it("uses the ProductShell workspace as the only main landmark", () => {
    const html = renderPage();
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toContain('<main class="ledger-app-workspace bank-workspace">');
    expect(html).not.toContain('<main class="admin-page"');
  });

  it("marks Overview and Administration as current pages", () => {
    const html = renderPage();
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/admin"|<a[^>]*href="\/admin"[^>]*aria-current="page"/);
    expect(html.match(/aria-current="page"/g)).toHaveLength(2);
  });
});
