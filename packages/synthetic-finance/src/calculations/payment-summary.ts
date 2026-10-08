import type { BusinessId, IsoDate, IsoDateTime } from "../domain/index.js";
import { getUtcCalendarDate } from "../internal/date.js";
import {
  getPayments,
  getPendingPayments,
} from "../selectors/payments.js";
import type { FinanceDataset } from "../validation/index.js";

export interface PaymentSummaryOptions {
  businessId: BusinessId;
  asOf: IsoDate | IsoDateTime;
}

export interface PaymentSummary {
  totalPending: number;
  awaitingApproval: number;
  scheduled: number;
  processing: number;
  failed: number;
  completedToday: number;
}

export function getPaymentSummary(
  dataset: FinanceDataset,
  options: PaymentSummaryOptions,
): PaymentSummary {
  const payments = getPayments(dataset, { businessId: options.businessId });
  const pending = getPendingPayments(dataset, { businessId: options.businessId });
  const asOfDate = getUtcCalendarDate(options.asOf);

  return {
    totalPending: pending.length,
    awaitingApproval: pending.filter(({ status }) => status === "awaiting-approval").length,
    scheduled: pending.filter(({ status }) => status === "scheduled").length,
    processing: pending.filter(({ status }) => status === "processing").length,
    failed: payments.filter(({ status }) => status === "failed").length,
    completedToday: payments.filter(
      (payment) =>
        payment.status === "completed" &&
        payment.completedAt !== undefined &&
        getUtcCalendarDate(payment.completedAt) === asOfDate,
    ).length,
  };
}
