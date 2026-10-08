import type {
  AccountId,
  BeneficiaryId,
  BusinessId,
  CurrencyCode,
  Payment,
  PaymentId,
  PaymentStatus,
  UserId,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface PaymentQueryOptions {
  businessId?: BusinessId;
  sourceAccountId?: AccountId;
  beneficiaryId?: BeneficiaryId;
  status?: PaymentStatus;
  currency?: CurrencyCode;
  createdByUserId?: UserId;
}

export type DerivedPaymentQueryOptions = Omit<PaymentQueryOptions, "status">;

/** Returns matching payments newest first by createdAt. */
export function getPayments(
  dataset: FinanceDataset,
  options: PaymentQueryOptions = {},
): Payment[] {
  return dataset.payments
    .filter(
      (payment) =>
        (options.businessId === undefined || payment.businessId === options.businessId) &&
        (options.sourceAccountId === undefined ||
          payment.sourceAccountId === options.sourceAccountId) &&
        (options.beneficiaryId === undefined ||
          payment.beneficiaryId === options.beneficiaryId) &&
        (options.status === undefined || payment.status === options.status) &&
        (options.currency === undefined || payment.currency === options.currency) &&
        (options.createdByUserId === undefined ||
          payment.createdByUserId === options.createdByUserId),
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getPaymentById(
  dataset: FinanceDataset,
  paymentId: PaymentId,
): Payment | undefined {
  return dataset.payments.find(({ id }) => id === paymentId);
}

export function getPendingPayments(
  dataset: FinanceDataset,
  options: DerivedPaymentQueryOptions = {},
): Payment[] {
  const pendingStatuses = new Set<PaymentStatus>([
    "awaiting-approval",
    "scheduled",
    "processing",
  ]);
  return getPayments(dataset, options).filter(({ status }) => pendingStatuses.has(status));
}

export function getPaymentsAwaitingApproval(
  dataset: FinanceDataset,
  options: DerivedPaymentQueryOptions = {},
): Payment[] {
  return getPayments(dataset, { ...options, status: "awaiting-approval" });
}
