import type {
  AccountId,
  BusinessId,
  CounterpartyId,
  CurrencyCode,
  IsoDate,
  PaymentId,
  Transaction,
  TransactionDirection,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface TransactionQueryOptions {
  accountId?: AccountId;
  businessId?: BusinessId;
  counterpartyId?: CounterpartyId;
  paymentId?: PaymentId;
  direction?: TransactionDirection;
  currency?: CurrencyCode;
  /** Inclusive lower bound applied to valueDate. */
  from?: IsoDate;
  /** Inclusive upper bound applied to valueDate. */
  to?: IsoDate;
}

/** Returns matching transactions newest first by bookedAt. */
export function getTransactions(
  dataset: FinanceDataset,
  options: TransactionQueryOptions = {},
): Transaction[] {
  const businessAccountIds = options.businessId === undefined
    ? undefined
    : new Set(
        dataset.accounts
          .filter(({ businessId }) => businessId === options.businessId)
          .map(({ id }) => id),
      );

  return dataset.transactions
    .filter(
      (transaction) =>
        (options.accountId === undefined || transaction.accountId === options.accountId) &&
        (businessAccountIds === undefined || businessAccountIds.has(transaction.accountId)) &&
        (options.counterpartyId === undefined ||
          transaction.counterpartyId === options.counterpartyId) &&
        (options.paymentId === undefined || transaction.paymentId === options.paymentId) &&
        (options.direction === undefined || transaction.direction === options.direction) &&
        (options.currency === undefined || transaction.currency === options.currency) &&
        (options.from === undefined || transaction.valueDate >= options.from) &&
        (options.to === undefined || transaction.valueDate <= options.to),
    )
    .sort((left, right) => right.bookedAt.localeCompare(left.bookedAt));
}
