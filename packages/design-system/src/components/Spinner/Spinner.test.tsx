import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("is decorative without a label", () => {
    const html = renderToStaticMarkup(<Spinner size="small" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("ledger-spinner--small");
  });

  it("creates a named status when used alone", () => {
    const html = renderToStaticMarkup(<Spinner label="Loading accounts" />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading accounts"');
  });
});
