"use client";

import { useMemo } from "react";
import { useEffectiveAccounts, useEffectiveBeneficiaries, useEffectivePaymentApprovals, useEffectivePayments } from "../useBankEffectiveState";
import { BANK_FINANCE_AS_OF } from "../../src/finance/environment";
import type { BankPayment } from "../../src/finance/payments";
import { PaymentsDataTable } from "./PaymentsDataTable";

export function EffectivePaymentsOverview() {
  const payments = useEffectivePayments();
  const accounts = useEffectiveAccounts();
  const beneficiaries = useEffectiveBeneficiaries();
  const approvals = useEffectivePaymentApprovals();
  const rows = useMemo(() => {
    const accountById = new Map(accounts.map((account) => [account.id, account]));
    const beneficiaryById = new Map(beneficiaries.map((beneficiary) => [beneficiary.id, beneficiary]));
    return payments.flatMap((payment) => {
      const sourceAccount = accountById.get(payment.sourceAccountId);
      const beneficiary = beneficiaryById.get(payment.beneficiaryId);
      return sourceAccount && beneficiary
        ? [{ ...payment, sourceAccount, beneficiary } as BankPayment]
        : [];
    });
  }, [accounts, beneficiaries, payments]);
  const inProgress = payments.filter(({ status }) => ["scheduled", "processing"].includes(status));
  const outstandingApprovals = approvals.filter(({ status }) => status === "pending");
  const paymentsAwaitingApproval = new Set(outstandingApprovals.map(({ paymentId }) => paymentId)).size;
  const completedToday = payments.filter(({ status, completedAt }) =>
    status === "completed" && completedAt?.slice(0, 10) === BANK_FINANCE_AS_OF.slice(0, 10),
  ).length;

  return <>
    <section className="payment-summary" aria-labelledby="payment-summary-heading">
      <h2 id="payment-summary-heading" className="visually-hidden">Payment summary</h2>
      <div className="payment-summary-primary">
        <strong className="payment-summary-value financial-value">{inProgress.length}</strong>
        <span>Payments in progress</span>
        <p>{inProgress.filter(({ status }) => status === "scheduled").length} scheduled · {inProgress.filter(({ status }) => status === "processing").length} processing</p>
      </div>
      <div className="payment-summary-approvals">
        <strong className="payment-summary-value financial-value">{outstandingApprovals.length}</strong>
        <span>Outstanding approvals</span>
        <p>Across {paymentsAwaitingApproval} payments</p>
      </div>
      <div className="payment-summary-secondary">
        <div>
          <strong className="payment-summary-value financial-value">{payments.filter(({ status }) => status === "failed").length}</strong>
          <span>Failed</span>
        </div>
        <div>
          <strong className="payment-summary-value financial-value">{completedToday}</strong>
          <span>Completed today</span>
        </div>
      </div>
    </section>
    <section className="payment-list" aria-labelledby="payment-list-heading"><h2 id="payment-list-heading" className="visually-hidden">Payments</h2><div className="payments-heading"><span>{rows.length} payments</span></div><PaymentsDataTable payments={rows} /></section>
  </>;
}
