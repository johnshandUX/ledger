import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PaymentDetailPage from "./page";

describe("payment detail", () => {
  it("resolves beneficiary, source account and approval actions", async () => {
    const html = renderToStaticMarkup(await PaymentDetailPage({ params: Promise.resolve({ paymentId: "payment-awaiting-01" }) }));
    expect(html).toContain("Apex Steelworks");
    expect(html).toContain("Supplier Payments");
    expect(html).toContain("•••• 0001");
    expect(html).toContain("Amelia Hart");
    expect(html).toContain("Daniel Okafor");
    expect(html).toContain("Approval information");
  });
  it("omits approval information when no approval records exist", async () => {
    const html = renderToStaticMarkup(await PaymentDetailPage({ params: Promise.resolve({ paymentId: "payment-completed-04" }) }));
    expect(html).not.toContain("Approval information");
    expect(html).toContain("Completed");
  });
  it("uses the route not-found boundary for an unknown payment", async () => {
    await expect(PaymentDetailPage({ params: Promise.resolve({ paymentId: "unknown-payment" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});
