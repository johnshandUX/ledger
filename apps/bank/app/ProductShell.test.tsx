import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { bankNavigation, bankUtilityNavigation, ProductShell } from "./ProductShell";

describe("ProductShell", () => {
  it("composes the application-navigation pattern with Bank-owned content", () => {
    const html = renderToStaticMarkup(
      <ProductShell activeRoute="accounts">
        <div>Content</div>
      </ProductShell>,
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain("Ledger Bank");
    expect(html).toContain("Caldermere Ltd");
    expect(html).toContain("Amelia Hart");
    expect(html).toContain("Administrator");
    expect(html).toContain('href="/payments"');
    expect(html).toContain('href="/reports"');
    expect(html).toContain('href="/treasury/fx"');
    expect(html).toContain('href="/operations/receivables"');
    expect(html).toContain('href="/integrations"');
    expect(html).toContain('aria-label="Utility"');
    expect(html).toContain('aria-label="Hide navigation"');
    expect(html).not.toContain('aria-disabled="true"');
    expect(html).not.toContain("J. Finance");
  });

  it("keeps the approved route ordering and grouping in the Bank application", () => {
    expect(bankNavigation).toEqual([
      {
        label: undefined,
        destinations: [
          { id: "accounts", label: "Accounts", href: "/" },
          { id: "payments", label: "Payments", href: "/payments" },
          { id: "expenses", label: "Expenses", href: "/expenses" },
          { id: "reports", label: "Reports", href: "/reports" },
        ],
      },
      {
        label: "Treasury",
        destinations: [
          { id: "cash-flow", label: "Cash flow", href: "/treasury/cash-flow" },
          { id: "fx", label: "FX", href: "/treasury/fx" },
          { id: "liquidity", label: "Liquidity", href: "/treasury/liquidity" },
          { id: "forecasting", label: "Forecasting", href: "/treasury/forecasting" },
        ],
      },
      {
        label: "Operations",
        destinations: [
          { id: "receivables", label: "Receivables", href: "/operations/receivables" },
          { id: "payables", label: "Payables", href: "/operations/payables" },
        ],
      },
    ]);
    expect(bankUtilityNavigation).toEqual([
      { id: "integrations", label: "Integrations", href: "/integrations" },
      { id: "admin", label: "Admin", href: "/admin" },
    ]);
  });

  it("keeps Reports primary and excludes rejected destinations", () => {
    const html = renderToStaticMarkup(
      <ProductShell activeRoute="reports"><div>Content</div></ProductShell>,
    );

    expect(html.indexOf(">Expenses<")).toBeLessThan(html.indexOf(">Reports<"));
    expect(html.indexOf(">Reports<")).toBeLessThan(html.indexOf(">Treasury<"));
    expect(html).not.toContain(">Analysis<");
    expect(html).not.toContain(">Insights<");
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/reports"|<a[^>]*href="\/reports"[^>]*aria-current="page"/);
  });
});
