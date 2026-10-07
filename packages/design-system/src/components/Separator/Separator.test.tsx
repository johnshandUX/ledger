import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Separator } from "./Separator";

describe("Separator", () => {
  it("renders a decorative horizontal rule by default", () => {
    const html = renderToStaticMarkup(<Separator />);
    expect(html).toContain("<hr");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("ledger-separator--horizontal");
  });

  it("exposes semantic orientation when requested", () => {
    const html = renderToStaticMarkup(<Separator orientation="vertical" decorative={false} />);
    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-orientation="vertical"');
  });
});
