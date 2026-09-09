import { CurrencyCode, DEFAULT_CURRENCY } from "./CurrencyCode";

export interface Payment {
  id: string;
  businessId: string; // owning business
  createdByProfileId: string; // which BusinessProfile created it
  fromAccountId: string;
  toBeneficiaryId?: string;
  amount: number;
  currency: CurrencyCode;
  status: "pending" | "pending-approval" | "approved" | "failed";
  createdAt: string;
  reference?: string;
}

export function makePayment(props: Partial<Payment> & { id: string; businessId: string; createdByProfileId: string; fromAccountId: string; amount: number; createdAt: string; }) {
  return {
    currency: DEFAULT_CURRENCY,
    status: "pending",
    ...props,
  } as Payment;
}

export default Payment;
