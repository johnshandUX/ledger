import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Icon } from "./Icon";
import { iconCatalog } from "./icons";
import type { IconName } from "./icons";

describe("Icon", () => {
  it("renders decorative icons hidden from assistive technology", () => {
    const html = renderToStaticMarkup(<Icon name="search" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });

  it("gives meaningful icons an image role and accessible label", () => {
    const html = renderToStaticMarkup(<Icon name="warning" aria-label="Payment requires review" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Payment requires review"');
    expect(html).not.toContain('aria-hidden="true"');
  });

  it("uses currentColor and the supported size scale", () => {
    const html = renderToStaticMarkup(<Icon name="download" size="large" />);
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('width="24"');
    expect(html).toContain('height="24"');
  });

  it("keeps every catalogue entry addressable by IconName", () => {
    expect(iconCatalog).toHaveLength(36);
    expectTypeOf<IconName>().toEqualTypeOf<(typeof iconCatalog)[number]["name"]>();
  });

  it("exposes the approved warning and appearance semantics", () => {
    const catalogueNames: ReadonlyArray<string> = iconCatalog.map(({ name }) => name);

    expect(iconCatalog.find(({ name }) => name === "warning")?.lucideName).toBe("TriangleAlert");
    expect(catalogueNames).not.toContain("account");
    expect(catalogueNames).toContain("sun");
    expect(catalogueNames).toContain("moon");
  });
});
