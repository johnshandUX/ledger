import type { DeepReadonly, FinanceDataset, Transaction } from "@johnshandux/ledger-synthetic-finance";
import type { ReportOutputRow, ReportingDateRange, ReportingDirection } from "./types";

export type ReportingQuery = Readonly<{
  organisationId: string; selectedAccountIds: readonly string[]; period: ReportingDateRange;
  direction: ReportingDirection; minimumAmountMinor?: number; maximumAmountMinor?: number; currency?: string;
}>;
export type ReportingCoverage = Readonly<{
  earliestObservedDate?: string; latestObservedDate?: string; accountIdsWithHistory: readonly string[];
  accountIdsWithoutHistory: readonly string[]; observedRangesByAccount: Readonly<Record<string, ReportingDateRange>>;
  startsBeforeObservedRecords: boolean; endsAfterObservedRecords: boolean;
}>;
export type ReportingQueryResult = Readonly<{ rows: readonly ReportOutputRow[]; coverage: ReportingCoverage; representedCurrencies: readonly string[] }>;
type ReportingDataset = Pick<DeepReadonly<FinanceDataset>, "accounts" | "transactions" | "counterparties" | "payments">;

export function queryTransactionsForReport(dataset: ReportingDataset, query: ReportingQuery): ReportingQueryResult {
  const organisationAccountIds = new Set(dataset.accounts.filter(account => account.businessId === query.organisationId).map(account => account.id));
  const requestedIds = [...new Set(query.selectedAccountIds)];
  const invalidIds = requestedIds.filter(id => !organisationAccountIds.has(id));
  if (invalidIds.length > 0) throw new Error(`Unknown or inaccessible account IDs: ${invalidIds.join(", ")}`);
  const ineligibleIds = dataset.accounts.filter(account => requestedIds.includes(account.id) && !isReportingAccountEligible(account)).map(account => account.id);
  if (ineligibleIds.length > 0) throw new Error(`Ineligible reporting account IDs: ${ineligibleIds.join(", ")}`);
  if (!["all", "incoming", "outgoing"].includes(query.direction)) throw new Error(`Unsupported reporting direction: ${query.direction}`);
  const selectedIds = new Set(requestedIds);
  const selectedTransactions = dataset.transactions.filter(transaction => selectedIds.has(transaction.accountId));
  const observedDates = selectedTransactions.map(transaction => bookedDate(transaction.bookedAt)).sort();
  const earliestObservedDate = observedDates[0];
  const latestObservedDate = observedDates.at(-1);
  const accountNames = new Map(dataset.accounts.map(account => [account.id, account.name]));
  const identifiers = new Map(dataset.accounts.map(account => [account.id, account.accountNumber ?? account.id]));
  const counterparties = new Map(dataset.counterparties.map(counterparty => [counterparty.id, counterparty.name]));
  const references = new Map(dataset.payments.map(payment => [payment.id, payment.reference]));
  const rows = selectedTransactions.filter(transaction => matches(transaction, query)).sort(compareTransactions).map(transaction => ({
    transactionId: transaction.id, transactionDate: bookedDate(transaction.bookedAt), bookedAt: transaction.bookedAt,
    accountId: transaction.accountId, accountName: accountNames.get(transaction.accountId) ?? transaction.accountId,
    accountIdentifier: identifiers.get(transaction.accountId) ?? transaction.accountId, currency: transaction.currency,
    description: transaction.description, counterparty: transaction.counterpartyId ? counterparties.get(transaction.counterpartyId) : undefined,
    paymentReference: transaction.paymentId ? references.get(transaction.paymentId) : undefined,
    direction: transaction.direction, amountMinor: transaction.amountMinor,
  } satisfies ReportOutputRow));
  const accountsWithHistory = new Set(selectedTransactions.map(transaction => transaction.accountId));
  const observedRangesByAccount = Object.fromEntries(requestedIds.flatMap(accountId => {
    const dates = selectedTransactions.filter(transaction => transaction.accountId === accountId).map(transaction => bookedDate(transaction.bookedAt)).sort();
    return dates.length > 0 ? [[accountId, { from: dates[0]!, to: dates.at(-1)! }]] : [];
  }));
  return { rows, coverage: {
    earliestObservedDate, latestObservedDate,
    accountIdsWithHistory: requestedIds.filter(id => accountsWithHistory.has(id)),
    accountIdsWithoutHistory: requestedIds.filter(id => !accountsWithHistory.has(id)),
    observedRangesByAccount,
    startsBeforeObservedRecords: Object.values(observedRangesByAccount).some(range => query.period.from < range.from),
    endsAfterObservedRecords: Object.values(observedRangesByAccount).some(range => query.period.to > range.to),
  }, representedCurrencies: [...new Set(rows.map(row => row.currency))].sort() };
}

export function isReportingAccountEligible(account: { status: string }) { return account.status !== "closed"; }

function matches(transaction: DeepReadonly<Transaction>, query: ReportingQuery) {
  const date = bookedDate(transaction.bookedAt);
  if (date < query.period.from || date > query.period.to) return false;
  if (query.direction === "incoming" && transaction.direction !== "credit") return false;
  if (query.direction === "outgoing" && transaction.direction !== "debit") return false;
  if (query.currency && transaction.currency !== query.currency) return false;
  const magnitude = Math.abs(transaction.amountMinor);
  return !(query.minimumAmountMinor !== undefined && magnitude < query.minimumAmountMinor)
    && !(query.maximumAmountMinor !== undefined && magnitude > query.maximumAmountMinor);
}
function bookedDate(bookedAt: string) { return bookedAt.slice(0, 10); }
function compareTransactions(left: DeepReadonly<Transaction>, right: DeepReadonly<Transaction>) { return right.bookedAt.localeCompare(left.bookedAt) || left.id.localeCompare(right.id); }
