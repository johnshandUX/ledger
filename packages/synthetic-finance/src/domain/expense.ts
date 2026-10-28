import type {
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  MinorUnitAmount,
} from "./common.js";
import type {
  BusinessId,
  CardSpendingLimitId,
  CardTransactionId,
  ExpenseCardholderId,
  ExpenseCardId,
  ExpenseRecordId,
  ExpenseTeamId,
  MerchantId,
  TeamSpendingBudgetId,
  UserId,
} from "./ids.js";

export type ExpenseTeamStatus = "active" | "inactive";
export type ExpenseCardholderType = "employee" | "external-contractor";
export type ExpenseCardholderStatus =
  | "active"
  | "frozen"
  | "pending_activation"
  | "removed";
export type ExpenseCardType = "physical" | "virtual";
export type ExpenseCardStatus =
  | "pending_activation"
  | "active"
  | "frozen"
  | "expired"
  | "cancelled";
export type CardSpendingLimitType = "monthly" | "total" | "per_transaction";
export type CardTransactionStatus = "pending" | "settled" | "declined" | "reversed";
export type CardTransactionType = "purchase" | "refund";
export type ExpenseReceiptStatus = "missing" | "attached" | "not_required";
export type ExpenseReviewStatus = "not_required" | "pending_review" | "reviewed";
export type ExpenseReconciliationStatus = "unreconciled" | "matched" | "reconciled";
export type ExpenseMatchMethod = "automatic" | "manual";

export interface ExpenseTeam {
  id: ExpenseTeamId;
  businessId: BusinessId;
  name: string;
  description?: string;
  status: ExpenseTeamStatus;
}

export interface TeamSpendingBudget {
  id: TeamSpendingBudgetId;
  teamId: ExpenseTeamId;
  currency: CurrencyCode;
  amountMinor: MinorUnitAmount;
  period: "monthly";
  effectiveFrom: IsoDate;
  effectiveTo?: IsoDate;
}

export interface ExpenseCardholder {
  id: ExpenseCardholderId;
  businessId: BusinessId;
  primaryTeamId: ExpenseTeamId;
  userId?: UserId;
  displayName: string;
  email: string;
  type: ExpenseCardholderType;
  status: ExpenseCardholderStatus;
}

export interface ExpenseCard {
  id: ExpenseCardId;
  businessId: BusinessId;
  cardholderId: ExpenseCardholderId;
  spendingTeamId: ExpenseTeamId;
  name: string;
  type: ExpenseCardType;
  status: ExpenseCardStatus;
  lastFour: string;
  expiresAt?: IsoDate;
  issuedAt: IsoDate;
  activatedAt?: IsoDate;
  validFrom?: IsoDate;
  validTo?: IsoDate;
}

export interface CardSpendingLimit {
  id: CardSpendingLimitId;
  cardId: ExpenseCardId;
  currency: CurrencyCode;
  type: CardSpendingLimitType;
  amountMinor: MinorUnitAmount;
}

export interface Merchant {
  id: MerchantId;
  name: string;
  category?: string;
  categoryCode?: string;
}

/**
 * Amounts are always positive. `type` determines sign: settled refunds reduce
 * expenditure; pending refunds do not reduce committed spending.
 */
export interface CardTransaction {
  id: CardTransactionId;
  cardId: ExpenseCardId;
  cardholderId: ExpenseCardholderId;
  spendingTeamId: ExpenseTeamId;
  merchantId: MerchantId;
  amountMinor: MinorUnitAmount;
  currency: CurrencyCode;
  transactedAt: IsoDateTime;
  settledAt?: IsoDateTime;
  status: CardTransactionStatus;
  type: CardTransactionType;
  category?: string;
  reference?: string;
}

export interface ExpenseRecord {
  id: ExpenseRecordId;
  cardTransactionId: CardTransactionId;
  receiptStatus: ExpenseReceiptStatus;
  reviewStatus: ExpenseReviewStatus;
  reconciliationStatus: ExpenseReconciliationStatus;
  category?: string;
  matchMethod?: ExpenseMatchMethod;
  receiptAttachedAt?: IsoDateTime;
  reviewedAt?: IsoDateTime;
  reconciledAt?: IsoDateTime;
}
