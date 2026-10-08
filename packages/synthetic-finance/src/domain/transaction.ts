import type {
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  MinorUnitAmount,
} from "./common.js";
import type {
  AccountId,
  CounterpartyId,
  PaymentId,
  TransactionId,
} from "./ids.js";

export type TransactionDirection = "credit" | "debit";

export interface Transaction {
  id: TransactionId;
  accountId: AccountId;
  bookedAt: IsoDateTime;
  valueDate: IsoDate;
  amountMinor: MinorUnitAmount;
  currency: CurrencyCode;
  direction: TransactionDirection;
  description: string;
  counterpartyId?: CounterpartyId;
  paymentId?: PaymentId;
}
