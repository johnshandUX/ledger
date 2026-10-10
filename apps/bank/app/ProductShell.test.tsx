import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductShell } from "./ProductShell";

describe("ProductShell", () => {
  it("presents the selected route and Caldermere demo identity", () => {
    const html = renderToStaticMarkup(
      <ProductShell activeRoute="accounts">
        <main>Content</main>
      </ProductShell>,
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Amelia Hart");
    expect(html).toContain("Administrator");
    expect(html).toContain('href="/payments"');
    expect(html).not.toContain("J. Finance");
  });
});
