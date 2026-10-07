import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("associates its visible label and preserves native attributes", () => {
    const html = renderToStaticMarkup(<Textarea id="note" label="Payment note" name="note" rows={6} defaultValue="Invoice 1042" />);
    expect(html).toContain('for="note"');
    expect(html).toContain('<textarea id="note"');
    expect(html).toContain('name="note"');
    expect(html).toContain('rows="6"');
    expect(html).toContain('>Invoice 1042</textarea>');
  });

  it("combines hint, error and consumer-provided description relationships", () => {
    const html = renderToStaticMarkup(<Textarea id="note" label="Payment note" hint="Visible to approvers." error="Add a note." aria-describedby="policy" />);
    expect(html).toContain('aria-describedby="note-hint note-error policy"');
    expect(html).toContain('aria-invalid="true"');
  });
});
