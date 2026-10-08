import type {
  BusinessId,
  PaymentApproval,
  PaymentApprovalStatus,
  PaymentId,
  UserId,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface PaymentApprovalQueryOptions {
  paymentId?: PaymentId;
  approverUserId?: UserId;
  status?: PaymentApprovalStatus;
  businessId?: BusinessId;
}

export type OutstandingApprovalQueryOptions = Omit<
  PaymentApprovalQueryOptions,
  "status"
>;

/** Returns matching approval actions newest first by createdAt. */
export function getPaymentApprovals(
  dataset: FinanceDataset,
  options: PaymentApprovalQueryOptions = {},
): PaymentApproval[] {
  const businessPaymentIds = options.businessId === undefined
    ? undefined
    : new Set(
        dataset.payments
          .filter(({ businessId }) => businessId === options.businessId)
          .map(({ id }) => id),
      );

  return dataset.paymentApprovals
    .filter(
      (approval) =>
        (options.paymentId === undefined || approval.paymentId === options.paymentId) &&
        (options.approverUserId === undefined ||
          approval.approverUserId === options.approverUserId) &&
        (options.status === undefined || approval.status === options.status) &&
        (businessPaymentIds === undefined || businessPaymentIds.has(approval.paymentId)),
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getOutstandingApprovalActions(
  dataset: FinanceDataset,
  options: OutstandingApprovalQueryOptions = {},
): PaymentApproval[] {
  return getPaymentApprovals(dataset, { ...options, status: "pending" });
}
