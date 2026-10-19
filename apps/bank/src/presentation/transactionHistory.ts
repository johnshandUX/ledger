import type { BankTransaction } from "../finance/transactions";

export type TransactionDirectionFilter = "all" | "credit" | "debit";
export type TransactionSort = "newest" | "oldest" | "amount-high" | "amount-low";

export type TransactionCollectionCriteria = Readonly<{
  query: string;
  from: string;
  to: string;
  direction: TransactionDirectionFilter;
  sort: TransactionSort;
}>;

export const DEFAULT_TRANSACTION_CRITERIA: TransactionCollectionCriteria = {
  query: "",
  from: "",
  to: "",
  direction: "all",
  sort: "newest",
};

export const TRANSACTION_PAGE_SIZE = 25;

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function getDateRangeError(from: string, to: string): string | undefined {
  if (from && !isCalendarDate(from)) return "Enter a valid start date.";
  if (to && !isCalendarDate(to)) return "Enter a valid end date.";
  if (from && to && to < from) return "End date must be on or after the start date.";
  return undefined;
}

export function getBookedCalendarDate(bookedAt: string): string {
  return bookedAt.slice(0, 10);
}

function compareIds(left: BankTransaction, right: BankTransaction) {
  return left.id.localeCompare(right.id);
}

export function compareTransactions(left: BankTransaction, right: BankTransaction, sort: TransactionSort): number {
  if (sort === "newest" || sort === "oldest") {
    const dateDifference = left.bookedAt.localeCompare(right.bookedAt);
    if (dateDifference !== 0) return sort === "newest" ? -dateDifference : dateDifference;
  } else {
    const amountDifference = left.amountMinor - right.amountMinor;
    if (amountDifference !== 0) return sort === "amount-high" ? -amountDifference : amountDifference;
    const dateDifference = right.bookedAt.localeCompare(left.bookedAt);
    if (dateDifference !== 0) return dateDifference;
  }
  return compareIds(left, right);
}

export function collectTransactions(
  transactions: readonly BankTransaction[],
  criteria: TransactionCollectionCriteria,
): BankTransaction[] {
  const query = criteria.query.trim().toLocaleLowerCase("en-GB");
  return transactions
    .filter((transaction) => {
      if (query) {
        const searchable = [transaction.description, transaction.counterpartyName, transaction.reference]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase("en-GB").includes(query));
        if (!searchable) return false;
      }
      const bookedDate = getBookedCalendarDate(transaction.bookedAt);
      if (criteria.from && bookedDate < criteria.from) return false;
      if (criteria.to && bookedDate > criteria.to) return false;
      return criteria.direction === "all" || transaction.direction === criteria.direction;
    })
    .sort((left, right) => compareTransactions(left, right, criteria.sort));
}

export function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseTransactionCriteria(params: Pick<URLSearchParams, "get">): TransactionCollectionCriteria {
  const from = params.get("txFrom") ?? "";
  const to = params.get("txTo") ?? "";
  const direction = params.get("txDirection");
  const sort = params.get("txSort");
  const validFrom = isCalendarDate(from) ? from : "";
  const validTo = isCalendarDate(to) ? to : "";
  return {
    query: params.get("txQuery")?.trim() ?? "",
    from: validFrom && validTo && validTo < validFrom ? "" : validFrom,
    to: validFrom && validTo && validTo < validFrom ? "" : validTo,
    direction: direction === "credit" || direction === "debit" ? direction : "all",
    sort: sort === "oldest" || sort === "amount-high" || sort === "amount-low" ? sort : "newest",
  };
}
