import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./Alert";

describe("Alert", () => {
  it("does not create a live region by default", () => { const html = renderToStaticMarkup(<Alert><AlertTitle>Scheduled maintenance</AlertTitle><AlertDescription>Payments remain available.</AlertDescription></Alert>); expect(html).toContain("ledger-alert--neutral"); expect(html).not.toContain("role="); });
  it("supports explicit urgent announcement semantics", () => { const html = renderToStaticMarkup(<Alert variant="error" role="alert"><AlertTitle>Payment failed</AlertTitle></Alert>); expect(html).toContain('role="alert"'); expect(html).toContain("ledger-alert--error"); });
  it("renders semantic status icons as decorative reinforcement", () => {
    const html = renderToStaticMarkup(<Alert variant="success"><AlertTitle>Payment sent</AlertTitle><AlertDescription>The transfer is complete.</AlertDescription></Alert>);
    expect(html).toContain('ledger-alert__icon');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
  });

  it("keeps neutral alerts free of an implied status icon", () => {
    const html = renderToStaticMarkup(<Alert><AlertTitle>Account note</AlertTitle></Alert>);
    expect(html).not.toContain('ledger-alert__icon');
  });
});
