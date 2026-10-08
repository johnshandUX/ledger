import type {
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  MinorUnitAmount,
} from "./common.js";
import type {
  AccountId,
  BeneficiaryId,
  BusinessId,
  PaymentId,
  UserId,
} from "./ids.js";

export type PaymentStatus =
  | "draft"
  | "awaiting-approval"
  | "scheduled"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface Payment {
  id: PaymentId;
  businessId: BusinessId;
  sourceAccountId: AccountId;
  beneficiaryId: BeneficiaryId;
  amountMinor: MinorUnitAmount;
  currency: CurrencyCode;
  reference: string;
  status: PaymentStatus;
  createdByUserId: UserId;
  createdAt: IsoDateTime;
  scheduledFor?: IsoDate;
  completedAt?: IsoDateTime;
  failedAt?: IsoDateTime;
  cancelledAt?: IsoDateTime;
}
