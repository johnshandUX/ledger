import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductShell } from "./ProductShell";

describe("ProductShell", () => {
  it("presents the selected route and active fixture identity", () => {
    const html = renderToStaticMarkup(
      <ProductShell activeRoute="accounts">
        <main>Content</main>
      </ProductShell>,
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Alex Morgan");
    expect(html).toContain("Finance Director");
    expect(html).not.toContain("J. Finance");
  });
});
