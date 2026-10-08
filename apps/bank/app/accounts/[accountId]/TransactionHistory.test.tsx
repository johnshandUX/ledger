import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { BankTransaction } from "../../../src/finance/transactions";
import { createTransactionsPresentationRowModel, TransactionHistory } from "./TransactionHistory";

describe("TransactionHistory", () => {
  it("renders a useful empty state", () => {
    expect(renderToStaticMarkup(<TransactionHistory transactions={[]} />)).toContain("No transactions yet");
  });

  it("represents transaction direction in desktop and mobile presentations", () => {
    const transaction: BankTransaction = { id: "test", accountId: "account", direction: "debit", amountMinor: 8217, currency: "GBP", bookedAt: "2026-09-15T10:00:00Z", valueDate: "2026-09-15", description: "Courier services", counterpartyName: "Citywide Logistics", reference: "CW-88412" };
    const html = renderToStaticMarkup(<TransactionHistory transactions={[transaction]} />);
    expect(html).toContain("transactions-desktop");
    expect(html).toContain("transactions-mobile");
    expect(html).toContain("Money out");
    expect(html).toContain("Sort transactions by");
    expect(html).toContain("−£82.17");
    expect(html.match(/Courier services/g)).toHaveLength(2);
  });

  it("derives desktop and mobile ordering from the shared controlled row model", () => {
    const older: BankTransaction = { id: "older", accountId: "account", direction: "credit", amountMinor: 1000, currency: "GBP", bookedAt: "2026-09-01T10:00:00Z", valueDate: "2026-09-01", description: "Older" };
    const newer: BankTransaction = { id: "newer", accountId: "account", direction: "credit", amountMinor: 2000, currency: "GBP", bookedAt: "2026-09-15T10:00:00Z", valueDate: "2026-09-15", description: "Newer" };
    const rowModel = createTransactionsPresentationRowModel(
      [older, newer],
      { query: "", filters: {}, pageIndex: 0, pageSize: 2, sort: { columnId: "date", direction: "descending" } },
      [2],
    );

    expect(rowModel.visibleRows.map(transaction => transaction.id)).toEqual(["newer", "older"]);
  });
});
