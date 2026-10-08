import {
  getAccountById,
  getApprovalSummary,
  getBeneficiaries,
  getPaymentApprovals,
  getPaymentById,
  getPaymentSummary,
  getPendingPayments,
  getPayments,
  getPaymentsAwaitingApproval,
  getUserById,
  type Account,
  type Beneficiary,
  type FinanceDataset,
  type Payment,
  type PaymentApproval,
  type User,
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

export type BankPayment = Payment & {
  sourceAccount: Account;
  beneficiary: Beneficiary;
};

export type BankPaymentApproval = PaymentApproval & {
  approver: User;
};

export type BankPaymentDetail = BankPayment & {
  approvals: BankPaymentApproval[];
  createdBy: User;
};

export function getBankPaymentsFromEnvironment(
  environment: FinanceDataset,
): BankPayment[] {
  const businessId = environment.businesses[0]?.id;
  if (!businessId) return [];
  const beneficiaries = new Map(
    getBeneficiaries(environment, { businessId }).map((item) => [item.id, item]),
  );

  return getPayments(environment, { businessId }).map((payment) => {
    const sourceAccount = getAccountById(environment, payment.sourceAccountId);
    const beneficiary = beneficiaries.get(payment.beneficiaryId);
    if (!sourceAccount || !beneficiary) {
      throw new Error(`Payment ${payment.id} has an unresolved account or beneficiary.`);
    }
    return { ...payment, sourceAccount, beneficiary };
  });
}

export function getBankPaymentById(paymentId: string): BankPaymentDetail | undefined {
  return getBankPaymentByIdFromEnvironment(bankFinanceEnvironment, paymentId);
}

export function getBankPaymentByIdFromEnvironment(
  environment: FinanceDataset,
  paymentId: string,
): BankPaymentDetail | undefined {
  const payment = getPaymentById(environment, paymentId);
  const businessId = environment.businesses[0]?.id;
  if (!payment || !businessId || payment.businessId !== businessId) return undefined;

  const sourceAccount = getAccountById(environment, payment.sourceAccountId);
  const beneficiary = getBeneficiaries(environment, { businessId })
    .find(({ id }) => id === payment.beneficiaryId);
  const createdBy = getUserById(environment, payment.createdByUserId);
  if (!sourceAccount || !beneficiary || !createdBy) {
    throw new Error(`Payment ${payment.id} has an unresolved relationship.`);
  }
  const approvals = getPaymentApprovals(environment, { paymentId: payment.id, businessId })
    .map((approval) => {
      const approver = getUserById(environment, approval.approverUserId);
      if (!approver) throw new Error(`Approval ${approval.id} has an unresolved approver.`);
      return { ...approval, approver };
    });

  return { ...payment, sourceAccount, beneficiary, createdBy, approvals };
}

export function getBankPaymentOverviewFromEnvironment(environment: FinanceDataset) {
  const businessId = environment.businesses[0]?.id;
  if (!businessId) throw new Error("Finance environment has no business.");
  return {
    payments: getBankPaymentsFromEnvironment(environment),
    paymentSummary: getPaymentSummary(environment, { businessId, asOf: BANK_FINANCE_AS_OF }),
    approvalSummary: getApprovalSummary(environment, { businessId }),
  };
}

export function getBankPaymentOverview() {
  return getBankPaymentOverviewFromEnvironment(bankFinanceEnvironment);
}
