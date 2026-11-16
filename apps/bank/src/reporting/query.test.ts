import { describe, expect, it } from "vitest";
import { bankFinanceEnvironment, BANK_BUSINESS_ID } from "../finance/environment";
import { queryTransactionsForReport, type ReportingQuery } from "./query";

const base: ReportingQuery = { organisationId: BANK_BUSINESS_ID, selectedAccountIds: ["account-uk-customer-receipts"], period: { from: "2026-09-01", to: "2026-10-31" }, direction: "all" };
const query = (changes: Partial<ReportingQuery> = {}) => queryTransactionsForReport(bankFinanceEnvironment, { ...base, ...changes });

describe("reporting query", () => {
  it("queries one or multiple accounts without duplicates in deterministic order", () => {
    const single = query();
    const multiple = query({ selectedAccountIds: ["account-uk-customer-receipts", "account-wholesale-receipts"] });
    expect(single.rows.length).toBeGreaterThan(0);
    expect(multiple.rows.length).toBeGreaterThan(single.rows.length);
    expect(new Set(multiple.rows.map(row => row.transactionId)).size).toBe(multiple.rows.length);
    expect(multiple.rows).toEqual([...multiple.rows].sort((left, right) => right.bookedAt.localeCompare(left.bookedAt) || left.transactionId.localeCompare(right.transactionId)));
  });

  it("uses inclusive booked-date boundaries", () => {
    const result = query({ period: { from: "2026-10-07", to: "2026-10-07" } });
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.every(row => row.transactionDate === "2026-10-07")).toBe(true);
  });

  it("applies incoming, outgoing, amount, currency and combined filters", () => {
    expect(query({ direction: "incoming" }).rows.every(row => row.direction === "credit")).toBe(true);
    const outgoing = query({ selectedAccountIds: ["account-supplier-payments"], direction: "outgoing" });
    expect(outgoing.rows.length).toBeGreaterThan(0);
    expect(outgoing.rows.every(row => row.direction === "debit")).toBe(true);
    const filtered = query({ selectedAccountIds: ["account-usd-receipts", "account-uk-customer-receipts"], direction: "incoming", currency: "USD", minimumAmountMinor: 1_000_000, maximumAmountMinor: 2_000_000 });
    expect(filtered.rows).toHaveLength(1);
    expect(filtered.rows[0]).toMatchObject({ currency: "USD", direction: "credit" });
  });

  it("returns truthful empty and coverage states", () => {
    expect(query({ minimumAmountMinor: 999_999_999 }).rows).toHaveLength(0);
    const transactionAccountIds = new Set(bankFinanceEnvironment.transactions.map(transaction => transaction.accountId));
    const emptyAccount = bankFinanceEnvironment.accounts.find(account => account.businessId === BANK_BUSINESS_ID && !transactionAccountIds.has(account.id))!;
    const empty = query({ selectedAccountIds: [emptyAccount.id] });
    expect(empty.coverage.accountIdsWithoutHistory).toEqual([emptyAccount.id]);
    expect(empty.coverage.earliestObservedDate).toBeUndefined();
    const extended = query({ period: { from: "2020-01-01", to: "2030-01-01" } });
    expect(extended.coverage.startsBeforeObservedRecords).toBe(true);
    expect(extended.coverage.endsAfterObservedRecords).toBe(true);
  });

  it("rejects unknown or cross-organisation account IDs", () => {
    expect(() => query({ selectedAccountIds: ["missing-account"] })).toThrow(/Unknown or inaccessible/);
    const closedAccount = bankFinanceEnvironment.accounts.find(account => account.businessId === BANK_BUSINESS_ID && account.status === "closed")!;
    expect(() => query({ selectedAccountIds: [closedAccount.id] })).toThrow(/Ineligible reporting account/);
  });
});
