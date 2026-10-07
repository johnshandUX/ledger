import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("renders named determinate progress", () => { const html = renderToStaticMarkup(<Progress label="Uploading statement" value={40} />); expect(html).toContain('role="progressbar"'); expect(html).toContain('aria-label="Uploading statement"'); expect(html).toContain('aria-valuenow="40"'); expect(html).toContain('aria-valuemax="100"'); expect(html).toContain("translateX(-60%)"); });
  it("renders indeterminate progress without a current value", () => { const html = renderToStaticMarkup(<Progress label="Connecting to bank" value={null} />); expect(html).toContain('data-state="indeterminate"'); expect(html).not.toContain("aria-valuenow"); });
  it("rejects invalid bounds", () => { expect(() => renderToStaticMarkup(<Progress label="Invalid" value={101} />)).toThrow(/between zero and max/); expect(() => renderToStaticMarkup(<Progress label="Invalid" value={0} max={0} />)).toThrow(/greater than zero/); });
});

if (false) {
  // @ts-expect-error Radix composition is not part of the Ledger API.
  void <Progress label="Invalid" value={10} asChild />;
  // @ts-expect-error Radix value-label formatting is not part of the Ledger API.
  void <Progress label="Invalid" value={10} getValueLabel={() => "Ten percent"} />;
}
