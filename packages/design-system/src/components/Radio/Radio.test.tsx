import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("preserves native radio grouping and label association", () => {
    const html = renderToStaticMarkup(<Radio id="speed-standard" name="speed" value="standard" label="Standard" />);
    expect(html).toContain('for="speed-standard"');
    expect(html).toContain('type="radio"');
    expect(html).toContain('name="speed"');
    expect(html).toContain('value="standard"');
  });

  it("links supporting content and exposes invalid state", () => {
    const html = renderToStaticMarkup(<Radio id="speed-same-day" name="speed" label="Same day" hint="Fees may apply." error="Choose a payment speed." aria-describedby="speed-policy" aria-invalid={false} />);
    expect(html).toContain('aria-describedby="speed-same-day-hint speed-same-day-error speed-policy"');
    expect(html).toContain('aria-invalid="true"');
  });

  it("preserves a consumer-provided invalid state when there is no error message", () => {
    const html = renderToStaticMarkup(<Radio id="speed-standard" name="speed" label="Standard" aria-invalid="grammar" />);
    expect(html).toContain('aria-invalid="grammar"');
  });
});
