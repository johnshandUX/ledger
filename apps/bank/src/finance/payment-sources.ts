import type { Account } from "@johnshandux/ledger-synthetic-finance";

import { BANK_BUSINESS_ID } from "./environment";

export type PaymentSourceEligibility = Readonly<
  | { eligible: true }
  | { eligible: false; reason: string }
>;

export function getPaymentSourceEligibility(
  account: Pick<Account, "businessId" | "status" | "accountType" | "currency" | "accountNumber">,
): PaymentSourceEligibility {
  if (account.businessId !== BANK_BUSINESS_ID) {
    return { eligible: false, reason: "Payments are not available from this business account." };
  }
  if (account.status === "restricted") {
    return { eligible: false, reason: "Payments cannot be made from a restricted account." };
  }
  if (account.status === "closed") {
    return { eligible: false, reason: "Payments cannot be made from a closed account." };
  }
  if (account.currency !== "GBP") {
    return { eligible: false, reason: "Payments V2 currently supports GBP accounts only." };
  }
  if (account.accountType !== "current") {
    return { eligible: false, reason: "Payments can only be made from current accounts." };
  }
  if (!account.accountNumber) {
    return { eligible: false, reason: "This account does not have the account details required to make a payment." };
  }

  return { eligible: true };
}

export function isEligiblePaymentSourceAccount(
  account: Pick<Account, "businessId" | "status" | "accountType" | "currency" | "accountNumber">,
): boolean {
  return getPaymentSourceEligibility(account).eligible;
}
