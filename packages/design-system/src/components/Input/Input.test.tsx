import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("keeps a visually hidden label as the control's accessible name", () => {
    const html = renderToStaticMarkup(
      <Input
        label="Search accounts"
        visuallyHiddenLabel
        placeholder="Search accounts"
        type="search"
      />,
    );

    expect(html).toContain('class="ledger-input-label ledger-input-label--visually-hidden"');
    expect(html).toContain('for="search-accounts"');
    expect(html).toContain('id="search-accounts"');
    expect(html).toContain(">Search accounts</label>");
  });

  it("shows labels by default", () => {
    const html = renderToStaticMarkup(<Input label="Account name" />);

    expect(html).toContain('class="ledger-input-label"');
    expect(html).not.toContain("ledger-input-label--visually-hidden");
  });
});
