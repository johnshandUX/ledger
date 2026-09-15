import { CurrencyCode, DEFAULT_CURRENCY } from "./CurrencyCode";

export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "pending" | "booked";

/**
 * `amount` is always unsigned and `direction` is the sole source of truth for
 * money entering or leaving the account. Pending entries may omit
 * `balanceAfter`; when present it is finite, may be negative, and represents
 * the ledger balance after posting.
 */
export interface Transaction {
  id: string;
  accountId: string;
  direction: TransactionDirection;
  amount: number;
  currency: CurrencyCode;
  postedAt: string;
  status: TransactionStatus;
  description: string;
  counterpartyName?: string;
  reference?: string;
  balanceAfter?: number;
}

export function makeTransaction(props: Partial<Transaction> & { id: string; accountId: string; direction: TransactionDirection; amount: number; postedAt: string; description: string; }) {
  if (!Number.isFinite(props.amount) || props.amount < 0) {
    throw new Error("Transaction amounts must be finite and unsigned");
  }
  if (props.balanceAfter !== undefined && !Number.isFinite(props.balanceAfter)) {
    throw new Error("Transaction balance after posting must be finite");
  }

  return {
    ...props,
    currency: props.currency ?? DEFAULT_CURRENCY,
    status: props.status ?? "booked",
  } as Transaction;
}

export default Transaction;
