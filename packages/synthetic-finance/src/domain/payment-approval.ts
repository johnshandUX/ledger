import type { IsoDateTime } from "./common.js";
import type { PaymentApprovalId, PaymentId, UserId } from "./ids.js";

export type PaymentApprovalStatus = "pending" | "approved" | "rejected";

export interface PaymentApproval {
  id: PaymentApprovalId;
  paymentId: PaymentId;
  approverUserId: UserId;
  status: PaymentApprovalStatus;
  createdAt: IsoDateTime;
  actedAt?: IsoDateTime;
}
