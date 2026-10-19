import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { BankTransaction } from "../../../src/finance/transactions";
import { TransactionHistory } from "./TransactionHistory";

const transaction: BankTransaction = { id: "test", accountId: "account", direction: "debit", amountMinor: 8217, currency: "GBP", bookedAt: "2026-09-15T10:00:00Z", valueDate: "2026-09-15", description: "Courier services", counterpartyName: "Citywide Logistics", reference: "CW-88412" };

describe("TransactionHistory", () => {
  it("renders a distinct empty account state", () => {
    expect(renderToStaticMarkup(<TransactionHistory transactions={[]} />)).toContain("No transactions to show yet");
  });

  it("represents transaction direction in desktop and mobile presentations", () => {
    const html = renderToStaticMarkup(<TransactionHistory transactions={[transaction]} />);
    expect(html).toContain("transactions-desktop");
    expect(html).toContain("transactions-mobile");
    expect(html).toContain("Money out");
    expect(html).toContain("−£82.17");
    expect(html.match(/Citywide Logistics/g)).toHaveLength(2);
  });

  it("restores valid URL criteria for the initial render", () => {
    const html = renderToStaticMarkup(<TransactionHistory transactions={[transaction]} initialSearchParams={{ txDirection: "credit" }} />);
    expect(html).toContain("No transactions match your search or filters");
    expect(html).toContain("Reset filters");
  });

  it("exposes only the agreed sorting choices and accessible direction toggles", () => {
    const html = renderToStaticMarkup(<TransactionHistory transactions={[transaction]} />);
    expect(html).toContain("Newest first");
    expect(html).toContain("Oldest first");
    expect(html).toContain("Amount: highest first");
    expect(html).toContain("Amount: lowest first");
    expect(html).not.toContain("Sort by Status");
    expect(html).not.toContain(">All<");
    expect(html).toContain('aria-label="Filter by money in"');
    expect(html).toContain('aria-label="Filter by money out"');
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
  });

  it("restores one active direction without activating both toggles", () => {
    const html = renderToStaticMarkup(<TransactionHistory transactions={[transaction]} initialSearchParams={{ txDirection: "debit" }} />);
    expect(html).toContain('aria-label="Clear money out filter"');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
  });
});
