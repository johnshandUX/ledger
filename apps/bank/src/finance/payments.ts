import {
  getApprovalSummary,
  getPaymentSummary,
  getPendingPayments,
  getPayments,
  getPaymentsAwaitingApproval,
} from "@johnshandux/ledger-synthetic-finance";

import {
  BANK_BUSINESS_ID,
  BANK_FINANCE_AS_OF,
  bankFinanceEnvironment,
} from "./environment";

export function getBankPayments() {
  return getPayments(bankFinanceEnvironment, { businessId: BANK_BUSINESS_ID });
}

export function getBankPaymentsAwaitingApproval() {
  return getPaymentsAwaitingApproval(bankFinanceEnvironment, {
    businessId: BANK_BUSINESS_ID,
  });
}

export function getBankPendingPayments() {
  return getPendingPayments(bankFinanceEnvironment, {
    businessId: BANK_BUSINESS_ID,
  });
}

export function getBankPaymentSummary() {
  return getPaymentSummary(bankFinanceEnvironment, {
    businessId: BANK_BUSINESS_ID,
    asOf: BANK_FINANCE_AS_OF,
  });
}

export function getBankApprovalSummary() {
  return getApprovalSummary(bankFinanceEnvironment, {
    businessId: BANK_BUSINESS_ID,
  });
}
