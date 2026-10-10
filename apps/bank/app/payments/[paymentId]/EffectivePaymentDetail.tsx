"use client";

import Link from "next/link";
import { Badge } from "@johnshandux/ledger-design-system";
import { useEffectiveAccounts, useEffectiveBeneficiaries, useEffectivePaymentApprovals, useEffectivePaymentById, useEffectiveUsers } from "../../useBankEffectiveState";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { formatApprovalStatus, formatPaymentDate, formatPaymentStatus, getApprovalStatusVariant, getPaymentStatusVariant, maskAccountNumber } from "../../../src/presentation/payments";

export function EffectivePaymentDetail({ paymentId }: { paymentId: string }) {
  const payment = useEffectivePaymentById(paymentId);
  const accounts = useEffectiveAccounts();
  const beneficiaries = useEffectiveBeneficiaries();
  const users = useEffectiveUsers();
  const approvals = useEffectivePaymentApprovals();
  if (!payment) return <main className="page payment-detail-page"><h1>Payment not found</h1><p>This payment is no longer available.</p><Link className="ledger-link" href="/payments">Back to payments</Link></main>;
  const account = accounts.find(({ id }) => id === payment.sourceAccountId);
  const beneficiary = beneficiaries.find(({ id }) => id === payment.beneficiaryId);
  const creator = users.find(({ id }) => id === payment.createdByUserId);
  if (!account || !beneficiary || !creator) return null;
  const paymentApprovals = approvals.filter(({ paymentId: id }) => id === payment.id);
  const approvalRows = paymentApprovals.flatMap((approval) => {
    const approver = users.find(({ id }) => id === approval.approverUserId);
    return approver ? [{ ...approval, approver }] : [];
  });

  return <main className="page payment-detail-page">
    <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/payments">Payments</Link></li><li aria-current="page">{payment.reference}</li></ol></nav>
    <header className="payment-detail-header"><div><p className="eyebrow">Payment reference</p><h1>{payment.reference}</h1></div><Badge variant={getPaymentStatusVariant(payment.status)}>{formatPaymentStatus(payment.status)}</Badge></header>
    <section className="payment-amount" aria-labelledby="payment-amount-heading"><h2 id="payment-amount-heading" className="visually-hidden">Payment amount</h2><span>Amount</span><strong className="financial-value">{formatMinorCurrencyAmount(payment.amountMinor, payment.currency)}</strong><p>{payment.currency} payment to {beneficiary.name}</p></section>
    <div className="payment-detail-grid">
      <section className="payment-detail-section" aria-labelledby="information-heading"><h2 id="information-heading">Payment information</h2><dl><div><dt>Reference</dt><dd>{payment.reference}</dd></div><div><dt>Status</dt><dd><Badge variant={getPaymentStatusVariant(payment.status)}>{formatPaymentStatus(payment.status)}</Badge></dd></div><div><dt>Created</dt><dd>{formatPaymentDate(payment.createdAt, true)}</dd></div><div><dt>Created by</dt><dd>{creator.firstName} {creator.lastName}</dd></div>{payment.scheduledFor && <div><dt>Scheduled</dt><dd>{formatPaymentDate(payment.scheduledFor)}</dd></div>}{payment.completedAt && <div><dt>Completed</dt><dd>{formatPaymentDate(payment.completedAt, true)}</dd></div>}{payment.failedAt && <div><dt>Failed</dt><dd>{formatPaymentDate(payment.failedAt, true)}</dd></div>}{payment.cancelledAt && <div><dt>Cancelled</dt><dd>{formatPaymentDate(payment.cancelledAt, true)}</dd></div>}</dl></section>
      <section className="payment-detail-section" aria-labelledby="beneficiary-heading"><h2 id="beneficiary-heading">Recipient</h2><dl><div><dt>Name</dt><dd>{beneficiary.name}</dd></div><div><dt>Account name</dt><dd>{beneficiary.accountName}</dd></div><div><dt>Account number</dt><dd className="identifier">{maskAccountNumber(beneficiary.accountNumber)}</dd></div>{beneficiary.sortCode && <div><dt>Sort code</dt><dd className="identifier">{beneficiary.sortCode}</dd></div>}<div><dt>Currency</dt><dd>{beneficiary.currency}</dd></div></dl></section>
      <section className="payment-detail-section" aria-labelledby="source-heading"><h2 id="source-heading">Source account</h2><dl><div><dt>Account</dt><dd><Link className="ledger-link" href={`/accounts/${account.id}`}>{account.name}</Link></dd></div><div><dt>Account number</dt><dd className="identifier">{account.accountNumber ?? "—"}</dd></div>{account.sortCode && <div><dt>Sort code</dt><dd className="identifier">{account.sortCode}</dd></div>}<div><dt>Currency</dt><dd>{account.currency}</dd></div><div><dt>Account status</dt><dd className="payment-capitalise">{account.status}</dd></div></dl></section>
    </div>
    {approvalRows.length > 0 && <section className="payment-approvals" aria-labelledby="approvals-heading"><div className="section-heading"><div><h2 id="approvals-heading">Approval information</h2><p>Payment status and individual approval decisions are shown separately.</p></div></div><ol className="approval-list">{approvalRows.map(approval => <li key={approval.id}><div><strong>{approval.approver.firstName} {approval.approver.lastName}</strong><span>Requested {formatPaymentDate(approval.createdAt, true)}</span></div><div className="approval-result"><Badge variant={getApprovalStatusVariant(approval.status)}>{formatApprovalStatus(approval.status)}</Badge>{approval.actedAt && <small>Acted {formatPaymentDate(approval.actedAt, true)}</small>}</div></li>)}</ol></section>}
  </main>;
}
