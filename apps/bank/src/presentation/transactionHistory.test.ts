import { describe, expect, it } from "vitest";
import type { BankTransaction } from "../finance/transactions";
import { collectTransactions, DEFAULT_TRANSACTION_CRITERIA, getDateRangeError, parseTransactionCriteria } from "./transactionHistory";

const transactions: BankTransaction[] = [
  { id: "b", accountId: "account", direction: "debit", amountMinor: 1200000, currency: "GBP", bookedAt: "2026-09-15T12:00:00Z", valueDate: "2026-09-16", description: "Courier services", counterpartyName: "Citywide Logistics" },
  { id: "a", accountId: "account", direction: "credit", amountMinor: 800000, currency: "GBP", bookedAt: "2026-09-15T12:00:00Z", valueDate: "2026-09-14", description: "Client receipt", reference: "INV-443" },
  { id: "c", accountId: "account", direction: "credit", amountMinor: 1000, currency: "GBP", bookedAt: "2026-09-01T08:00:00Z", valueDate: "2026-09-01", description: "Interest" },
];

describe("transaction history collection", () => {
  it.each([" courier ", "CITYWIDE", "inv-443"])("searches supported fields using %s", query => {
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, query })).toHaveLength(1);
  });

  it("handles missing optional relationships", () => {
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, query: "interest" }).map(row => row.id)).toEqual(["c"]);
  });

  it("filters direction and independent inclusive booked-date boundaries", () => {
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, direction: "credit" }).map(row => row.id)).toEqual(["a", "c"]);
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, from: "2026-09-15" }).map(row => row.id)).toEqual(["a", "b"]);
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, to: "2026-09-01" }).map(row => row.id)).toEqual(["c"]);
  });

  it("sorts dates and absolute magnitudes deterministically", () => {
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, sort: "newest" }).map(row => row.id)).toEqual(["a", "b", "c"]);
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, sort: "oldest" }).map(row => row.id)).toEqual(["c", "a", "b"]);
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, sort: "amount-high" }).map(row => row.id)).toEqual(["b", "a", "c"]);
    expect(collectTransactions(transactions, { ...DEFAULT_TRANSACTION_CRITERIA, sort: "amount-low" }).map(row => row.id)).toEqual(["c", "a", "b"]);
  });

  it("validates ranges without applying invalid URL dates", () => {
    expect(getDateRangeError("2026-10-02", "2026-10-01")).toBe("End date must be on or after the start date.");
    expect(parseTransactionCriteria(new URLSearchParams("txFrom=2026-10-02&txTo=2026-10-01"))).toMatchObject({ from: "", to: "" });
    expect(parseTransactionCriteria(new URLSearchParams("txFrom=nope&txDirection=sideways&txSort=status"))).toEqual(DEFAULT_TRANSACTION_CRITERIA);
  });

  it("keeps all records available beyond the old 50-item limit", () => {
    const many = Array.from({ length: 61 }, (_, index) => ({ ...transactions[2], id: String(index), bookedAt: `2026-09-01T08:${String(index % 60).padStart(2, "0")}:00Z` }));
    expect(collectTransactions(many, DEFAULT_TRANSACTION_CRITERIA)).toHaveLength(61);
  });
});
