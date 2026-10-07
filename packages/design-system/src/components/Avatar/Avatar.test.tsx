import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders a consistently named, sized image container", () => { const html = renderToStaticMarkup(<Avatar src="/ada.jpg" alt="Ada Lovelace" fallback="AL" size="large" />); expect(html).toContain("ledger-avatar--large"); expect(html).toContain('role="img"'); expect(html).toContain('aria-label="Ada Lovelace"'); });
  it("keeps decorative fallback hidden when alt is empty", () => { const html = renderToStaticMarkup(<Avatar src="/team.jpg" alt="" fallback="LT" />); expect(html).toContain('aria-hidden="true"'); });
  it("supports delaying fallback presentation while an image loads", () => { const html = renderToStaticMarkup(<Avatar src="/slow.jpg" alt="Ada Lovelace" fallback="AL" fallbackDelayMs={400} />); expect(html).not.toContain(">AL<"); });
  it("rejects invalid fallback delays", () => { expect(() => renderToStaticMarkup(<Avatar src="/ada.jpg" alt="Ada Lovelace" fallback="AL" fallbackDelayMs={-1} />)).toThrow(/greater than or equal to zero/); });
});

if (false) {
  // @ts-expect-error Radix composition is unsafe for Avatar's fixed two-child anatomy.
  void <Avatar src="/ada.jpg" alt="Ada Lovelace" fallback="AL" asChild />;
}
