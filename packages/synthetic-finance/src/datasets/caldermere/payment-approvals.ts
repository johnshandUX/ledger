import type { PaymentApproval } from "../../domain/index.js";

export const caldermerePaymentApprovals = [
  { id: "approval-awaiting-01-director", paymentId: "payment-awaiting-01", approverUserId: "user-amelia-hart", status: "approved", createdAt: "2026-10-06T08:15:00Z", actedAt: "2026-10-06T09:02:00Z" },
  { id: "approval-awaiting-01-controller", paymentId: "payment-awaiting-01", approverUserId: "user-daniel-okafor", status: "pending", createdAt: "2026-10-06T08:15:00Z" },
  { id: "approval-awaiting-01-treasury", paymentId: "payment-awaiting-01", approverUserId: "user-priya-shah", status: "pending", createdAt: "2026-10-06T08:15:00Z" },

  { id: "approval-awaiting-02-controller", paymentId: "payment-awaiting-02", approverUserId: "user-daniel-okafor", status: "approved", createdAt: "2026-10-06T10:43:00Z", actedAt: "2026-10-06T11:08:00Z" },
  { id: "approval-awaiting-02-director", paymentId: "payment-awaiting-02", approverUserId: "user-amelia-hart", status: "pending", createdAt: "2026-10-06T10:43:00Z" },
  { id: "approval-awaiting-02-treasury", paymentId: "payment-awaiting-02", approverUserId: "user-priya-shah", status: "pending", createdAt: "2026-10-06T10:43:00Z" },

  { id: "approval-awaiting-03-treasury", paymentId: "payment-awaiting-03", approverUserId: "user-priya-shah", status: "approved", createdAt: "2026-10-06T14:27:00Z", actedAt: "2026-10-06T15:01:00Z" },
  { id: "approval-awaiting-03-director", paymentId: "payment-awaiting-03", approverUserId: "user-amelia-hart", status: "pending", createdAt: "2026-10-06T14:27:00Z" },
  { id: "approval-awaiting-03-controller", paymentId: "payment-awaiting-03", approverUserId: "user-daniel-okafor", status: "pending", createdAt: "2026-10-06T14:27:00Z" },

  { id: "approval-awaiting-04-controller", paymentId: "payment-awaiting-04", approverUserId: "user-daniel-okafor", status: "approved", createdAt: "2026-10-07T07:49:00Z", actedAt: "2026-10-07T08:16:00Z" },
  { id: "approval-awaiting-04-director", paymentId: "payment-awaiting-04", approverUserId: "user-amelia-hart", status: "pending", createdAt: "2026-10-07T07:49:00Z" },
] satisfies PaymentApproval[];
