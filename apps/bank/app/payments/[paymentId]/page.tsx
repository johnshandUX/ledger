import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@johnshandux/ledger-design-system";
import { getBankPaymentById } from "../../../src/finance/payments";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { formatApprovalStatus, formatPaymentDate, formatPaymentStatus, getApprovalStatusVariant, getPaymentStatusVariant, maskAccountNumber } from "../../../src/presentation/payments";
import { ProductShell } from "../../ProductShell";
import "../../accounts.css";
import "../payments.css";

export default async function PaymentDetailPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const payment = getBankPaymentById(paymentId);
  if (!payment) notFound();

  return <ProductShell activeRoute="payments"><main className="page payment-detail-page">
    <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/payments">Payments</Link></li><li aria-current="page">{payment.reference}</li></ol></nav>
    <header className="payment-detail-header"><div><p className="eyebrow">Payment reference</p><h1>{payment.reference}</h1></div><Badge variant={getPaymentStatusVariant(payment.status)}>{formatPaymentStatus(payment.status)}</Badge></header>
    <section className="payment-amount" aria-labelledby="payment-amount-heading"><h2 id="payment-amount-heading" className="visually-hidden">Payment amount</h2><span>Amount</span><strong className="financial-value">{formatMinorCurrencyAmount(payment.amountMinor, payment.currency)}</strong><p>{payment.currency} payment to {payment.beneficiary.name}</p></section>

    <div className="payment-detail-grid">
      <section className="payment-detail-section" aria-labelledby="information-heading"><h2 id="information-heading">Payment information</h2><dl>
        <div><dt>Reference</dt><dd>{payment.reference}</dd></div><div><dt>Status</dt><dd><Badge variant={getPaymentStatusVariant(payment.status)}>{formatPaymentStatus(payment.status)}</Badge></dd></div><div><dt>Created</dt><dd>{formatPaymentDate(payment.createdAt, true)}</dd></div><div><dt>Created by</dt><dd>{payment.createdBy.firstName} {payment.createdBy.lastName}</dd></div>
        {payment.scheduledFor && <div><dt>Scheduled</dt><dd>{formatPaymentDate(payment.scheduledFor)}</dd></div>}{payment.completedAt && <div><dt>Completed</dt><dd>{formatPaymentDate(payment.completedAt, true)}</dd></div>}{payment.failedAt && <div><dt>Failed</dt><dd>{formatPaymentDate(payment.failedAt, true)}</dd></div>}{payment.cancelledAt && <div><dt>Cancelled</dt><dd>{formatPaymentDate(payment.cancelledAt, true)}</dd></div>}
      </dl></section>
      <section className="payment-detail-section" aria-labelledby="beneficiary-heading"><h2 id="beneficiary-heading">Beneficiary</h2><dl><div><dt>Name</dt><dd>{payment.beneficiary.name}</dd></div><div><dt>Account name</dt><dd>{payment.beneficiary.accountName}</dd></div><div><dt>Account number</dt><dd className="identifier">{maskAccountNumber(payment.beneficiary.accountNumber)}</dd></div>{payment.beneficiary.sortCode && <div><dt>Sort code</dt><dd className="identifier">{payment.beneficiary.sortCode}</dd></div>}<div><dt>Currency</dt><dd>{payment.beneficiary.currency}</dd></div></dl></section>
      <section className="payment-detail-section" aria-labelledby="source-heading"><h2 id="source-heading">Source account</h2><dl><div><dt>Account</dt><dd><Link className="ledger-link" href={`/accounts/${payment.sourceAccount.id}`}>{payment.sourceAccount.name}</Link></dd></div><div><dt>Account number</dt><dd className="identifier">{payment.sourceAccount.accountNumber ?? "—"}</dd></div>{payment.sourceAccount.sortCode && <div><dt>Sort code</dt><dd className="identifier">{payment.sourceAccount.sortCode}</dd></div>}<div><dt>Currency</dt><dd>{payment.sourceAccount.currency}</dd></div><div><dt>Account status</dt><dd className="payment-capitalise">{payment.sourceAccount.status}</dd></div></dl></section>
    </div>

    {payment.approvals.length > 0 && <section className="payment-approvals" aria-labelledby="approvals-heading"><div className="section-heading"><div><h2 id="approvals-heading">Approval information</h2><p>Payment status and individual approval decisions are shown separately.</p></div></div><ol className="approval-list">{payment.approvals.map(approval => <li key={approval.id}><div><strong>{approval.approver.firstName} {approval.approver.lastName}</strong><span>Requested {formatPaymentDate(approval.createdAt, true)}</span></div><div className="approval-result"><Badge variant={getApprovalStatusVariant(approval.status)}>{formatApprovalStatus(approval.status)}</Badge>{approval.actedAt && <small>Acted {formatPaymentDate(approval.actedAt, true)}</small>}</div></li>)}</ol></section>}
  </main></ProductShell>;
}
