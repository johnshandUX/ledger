import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("associates its clickable label with a native checkbox", () => {
    const html = renderToStaticMarkup(<Checkbox id="remittance" name="remittance" label="Include remittance advice" />);
    expect(html).toContain('for="remittance"');
    expect(html).toContain('id="remittance"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('name="remittance"');
    expect(html).toContain('class="ledger-checkbox-indicator"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("links hint and error content and exposes invalid state", () => {
    const html = renderToStaticMarkup(<Checkbox id="terms" label="Accept terms" hint="Review the terms first." error="Acceptance is required." aria-describedby="terms-policy" aria-invalid={false} />);
    expect(html).toContain('aria-describedby="terms-hint terms-error terms-policy"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('id="terms-hint"');
    expect(html).toContain('id="terms-error"');
  });

  it("preserves a consumer-provided invalid state when there is no error message", () => {
    const html = renderToStaticMarkup(<Checkbox id="approval" label="Approval received" aria-invalid="spelling" />);
    expect(html).toContain('aria-invalid="spelling"');
  });
});
