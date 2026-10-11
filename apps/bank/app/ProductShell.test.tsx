import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { bankNavigation, ProductShell } from "./ProductShell";

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
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('aria-label="Hide navigation"');
    expect(html).not.toContain("J. Finance");
  });

  it("keeps route configuration in the Bank application", () => {
    expect(bankNavigation).toEqual([
      { id: "accounts", label: "Accounts", href: "/" },
      { id: "payments", label: "Payments", href: "/payments" },
      { id: "reporting", label: "Reporting" },
    ]);
  });
});
