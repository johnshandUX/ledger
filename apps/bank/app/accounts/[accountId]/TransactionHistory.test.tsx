import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { makeTransaction } from "../../../src/domain/Transaction";
import { TransactionHistory } from "./TransactionHistory";

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
    expect(html).toContain("−£82.17");
    expect(html.match(/Courier services/g)).toHaveLength(2);
  });
});
