import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { makeTransaction } from "../../../src/domain/Transaction";
import { createTransactionsPresentationRowModel, TransactionHistory } from "./TransactionHistory";

describe("TransactionHistory", () => {
  it("renders a useful empty state", () => {
    expect(renderToStaticMarkup(<TransactionHistory transactions={[]} />)).toContain("No transactions yet");
  });

  it("represents transaction direction in desktop and mobile presentations", () => {
    const transaction = makeTransaction({ id: "test", accountId: "account", direction: "debit", amount: 82.17, postedAt: "2026-09-15T10:00:00Z", description: "Courier services", counterpartyName: "Citywide Logistics", reference: "CW-88412", balanceAfter: 1000 });
    const html = renderToStaticMarkup(<TransactionHistory transactions={[transaction]} />);
    expect(html).toContain("transactions-desktop");
    expect(html).toContain("transactions-mobile");
    expect(html).toContain("Money out");
    expect(html).toContain("Sort transactions by");
    expect(html).toContain("−£82.17");
    expect(html.match(/Courier services/g)).toHaveLength(2);
  });

  it("derives desktop and mobile ordering from the shared controlled row model", () => {
    const older = makeTransaction({ id: "older", accountId: "account", direction: "credit", amount: 10, postedAt: "2026-09-01T10:00:00Z", description: "Older" });
    const newer = makeTransaction({ id: "newer", accountId: "account", direction: "credit", amount: 20, postedAt: "2026-09-15T10:00:00Z", description: "Newer" });
    const rowModel = createTransactionsPresentationRowModel(
      [older, newer],
      { query: "", filters: {}, pageIndex: 0, pageSize: 2, sort: { columnId: "date", direction: "descending" } },
      [2],
    );

    expect(rowModel.visibleRows.map(transaction => transaction.id)).toEqual(["newer", "older"]);
  });
});
