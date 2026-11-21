import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "./BankStateProvider";
import { bankNavigation, ProductShell } from "./ProductShell";

function renderProductShell(activeRoute: Parameters<typeof ProductShell>[0]["activeRoute"]) {
  return renderToStaticMarkup(
    <BankStateProvider>
      <ProductShell activeRoute={activeRoute}>
        <div>Content</div>
      </ProductShell>
    </BankStateProvider>,
  );
}

describe("ProductShell", () => {
  it("composes the application-navigation pattern with Bank-owned content", () => {
    const html = renderProductShell("accounts");

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Primary"');
    expect(html).not.toContain("Ledger Bank");
    expect(html).toContain("Caldermere Ltd");
    expect(html.match(/ledger-organisation-switcher__name/g)).toHaveLength(1);
    expect(html).not.toContain("ledger-side-nav__context");
    expect(html).not.toContain("Business account");
    expect(html).toContain('aria-label="Switch organisation: Caldermere Ltd"');
    expect(html).toContain("Amelia Hart");
    expect(html).toContain("Administrator");
    expect(html).toContain('href="/payments"');
    expect(html).toContain('href="/reports"');
    expect(html).toContain('href="/cashflow"');
    expect(html).toContain('href="/treasury"');
    expect(html).toMatch(/<section aria-labelledby="[^"]+" class="ledger-side-nav-group ledger-side-nav-group--labelled"><h2[^>]*>Operations<\/h2>/);
    expect(html).toContain('aria-label="Close navigation"');
    expect(html).not.toContain("J. Finance");
  });

  it("keeps the approved route ordering and grouping in the Bank application", () => {
    expect(bankNavigation).toEqual([
      {
        label: undefined,
        destinations: [
          { id: "accounts", label: "Accounts", href: "/" },
          { id: "payments", label: "Payments", href: "/payments" },
        ],
      },
      {
        label: "Operations",
        destinations: [
          { id: "cashflow", label: "Cashflow", href: "/cashflow" },
          { id: "expenses", label: "Expenses", href: "/expenses" },
          { id: "tax", label: "Tax", href: "/tax" },
          { id: "reports", label: "Reports", href: "/reports" },
          { id: "treasury", label: "Treasury", href: "/treasury" },
        ],
      },
      {
        label: undefined,
        destinations: [
          { id: "integrations", label: "Integrations", href: "/integrations" },
          { id: "admin", label: "Admin", href: "/admin" },
        ],
      },
    ]);
  });

  it("keeps Operations visible and excludes rejected destinations", () => {
    const html = renderProductShell("reports");

    expect(html.indexOf(">Cashflow<")).toBeLessThan(html.indexOf(">Expenses<"));
    expect(html.indexOf(">Expenses<")).toBeLessThan(html.indexOf(">Tax<"));
    expect(html.indexOf(">Tax<")).toBeLessThan(html.indexOf(">Reports<"));
    expect(html.indexOf(">Reports<")).toBeLessThan(html.indexOf(">Treasury<"));
    expect(html.indexOf(">Treasury<")).toBeLessThan(html.indexOf(">Integrations<"));
    expect(html).not.toContain(">Analysis<");
    expect(html).not.toContain(">Insights<");
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/reports"|<a[^>]*href="\/reports"[^>]*aria-current="page"/);
  });
});
