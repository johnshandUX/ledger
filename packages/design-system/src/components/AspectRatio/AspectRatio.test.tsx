import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AspectRatio } from "./AspectRatio";

describe("AspectRatio", () => {
  it("applies a finite positive ratio and preserves child semantics", () => {
    const html = renderToStaticMarkup(<AspectRatio ratio={16 / 9}><img src="/office.jpg" alt="Ledger office" /></AspectRatio>);
    expect(html).toContain("aspect-ratio:1.7777777777777777");
    expect(html).toContain('alt="Ledger office"');
  });

  it("rejects invalid ratios", () => {
    expect(() => renderToStaticMarkup(<AspectRatio ratio={0}><span /></AspectRatio>)).toThrow(/greater than zero/);
  });
});
