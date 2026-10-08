import type { BadgeVariant } from "@johnshandux/ledger-design-system";
import type { Payment, PaymentApprovalStatus, PaymentStatus } from "@johnshandux/ledger-synthetic-finance";

const paymentStatusLabels: Record<PaymentStatus, string> = {
  draft: "Draft",
  "awaiting-approval": "Awaiting approval",
  scheduled: "Scheduled",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const paymentStatusVariants: Record<PaymentStatus, BadgeVariant> = {
  draft: "neutral",
  "awaiting-approval": "warning",
  scheduled: "informational",
  processing: "informational",
  completed: "success",
  failed: "error",
  cancelled: "neutral",
};

const approvalStatusLabels: Record<PaymentApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const approvalStatusVariants: Record<PaymentApprovalStatus, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export function formatPaymentStatus(status: PaymentStatus) { return paymentStatusLabels[status]; }
export function getPaymentStatusVariant(status: PaymentStatus) { return paymentStatusVariants[status]; }
export function formatApprovalStatus(status: PaymentApprovalStatus) { return approvalStatusLabels[status]; }
export function getApprovalStatusVariant(status: PaymentApprovalStatus) { return approvalStatusVariants[status]; }

export function formatPaymentDate(value: string, includeTime = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
    timeZone: "Europe/London",
  }).format(new Date(value));
}

export function getPaymentStatusDate(payment: Payment): { label: string; value: string } {
  if (payment.status === "scheduled" && payment.scheduledFor) return { label: "Scheduled", value: payment.scheduledFor };
  if (payment.status === "completed" && payment.completedAt) return { label: "Completed", value: payment.completedAt };
  if (payment.status === "failed" && payment.failedAt) return { label: "Failed", value: payment.failedAt };
  if (payment.status === "cancelled" && payment.cancelledAt) return { label: "Cancelled", value: payment.cancelledAt };
  return { label: "Created", value: payment.createdAt };
}

export function maskAccountNumber(value: string): string {
  return value.length <= 4 ? value : `•••• ${value.slice(-4)}`;
}
