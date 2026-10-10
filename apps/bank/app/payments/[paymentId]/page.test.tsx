import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../../BankStateProvider";
import PaymentDetailPage from "./page";

async function renderPayment(paymentId: string) {
  return renderToStaticMarkup(<BankStateProvider>{await PaymentDetailPage({ params: Promise.resolve({ paymentId }) })}</BankStateProvider>);
}

describe("payment detail", () => {
  it("resolves beneficiary, source account and approval actions", async () => {
    const html = await renderPayment("payment-awaiting-01");
    expect(html).toContain("Apex Steelworks");
    expect(html).toContain("Supplier Payments");
    expect(html).toContain("•••• 0001");
    expect(html).toContain("Amelia Hart");
    expect(html).toContain("Daniel Okafor");
    expect(html).toContain("Approval information");
  });
  it("omits approval information when no approval records exist", async () => {
    const html = await renderPayment("payment-completed-04");
    expect(html).not.toContain("Approval information");
    expect(html).toContain("Completed");
  });
  it("handles an unavailable ephemeral or unknown payment gracefully", async () => {
    const html = await renderPayment("unknown-payment");
    expect(html).toContain("Payment not found");
    expect(html).toContain("This payment is no longer available.");
  });
});
