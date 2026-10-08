import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createCaldermereScenario } from "@johnshandux/ledger-synthetic-finance";
import { getBankPaymentsFromEnvironment } from "../../src/finance/payments";
import { bankFinanceEnvironment } from "../../src/finance/environment";
import { createPaymentsPresentationRowModel, PaymentsDataTable } from "./PaymentsDataTable";

describe("PaymentsDataTable", () => {
  const payments = getBankPaymentsFromEnvironment(bankFinanceEnvironment);
  it("renders Caldermere payments, formatted amounts, statuses and links in both presentations", () => {
    const awaiting = payments.find(({ id }) => id === "payment-awaiting-01")!;
    const html = renderToStaticMarkup(<PaymentsDataTable payments={[awaiting]} />);
    expect(html).toContain("APX-10482");
    expect(html).toContain("£12,504.00");
    expect(html).toContain("Awaiting approval");
    expect(html).toContain('href="/payments/payment-awaiting-01"');
    expect(html.match(/APX-10482/g)).toHaveLength(2);
  });
  it("sorts through the shared row model", () => {
    const model = createPaymentsPresentationRowModel(payments, { query: "", filters: {}, pageIndex: 0, pageSize: 20, sort: { columnId: "amount", direction: "descending" } });
    expect(model.sortedRows[0]!.amountMinor).toBeGreaterThanOrEqual(model.sortedRows[1]!.amountMinor);
  });
  it("renders the no-payment state", () => expect(renderToStaticMarkup(<PaymentsDataTable payments={[]} />)).toContain("No payments to display"));

  it("keeps large GBP and USD scenario payments legible and navigable", () => {
    const scenarioPayments = getBankPaymentsFromEnvironment(
      createCaldermereScenario({ scenario: "large-outgoing-payments" }),
    ).filter(({ id }) => id.startsWith("payment-scenario-large-"));
    const html = renderToStaticMarkup(<PaymentsDataTable payments={scenarioPayments} />);

    expect(html).toContain("£240,000.00");
    expect(html).toContain("US$75,000.00");
    expect(html).toContain('href="/payments/payment-scenario-large-001"');
    expect(html).toContain("Scheduled");
    expect(html).toContain("Processing");
    expect(html).toContain("Status date");
  });

  it("renders failed, completed and scheduled lifecycle statuses with their date labels", () => {
    const ids = new Set(["payment-failed-01", "payment-completed-today-01", "payment-scheduled-01"]);
    const html = renderToStaticMarkup(<PaymentsDataTable payments={payments.filter(({ id }) => ids.has(id))} />);

    expect(html).toContain("Failed");
    expect(html).toContain("Completed");
    expect(html).toContain("Scheduled");
    expect(html).toContain("ledger-badge--error");
    expect(html).toContain("ledger-badge--success");
    expect(html).toContain("ledger-badge--informational");
  });
});
