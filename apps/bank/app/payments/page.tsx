import "../accounts.css";
import "./payments.css";
import { getBankPaymentOverview } from "../../src/finance/payments";
import { ProductShell } from "../ProductShell";
import { PaymentsDataTable } from "./PaymentsDataTable";

export default function PaymentsPage() {
  const { payments, paymentSummary, approvalSummary } = getBankPaymentOverview();
  return <ProductShell activeRoute="payments"><main className="page payments-page">
    <header className="page-header"><div><h1>Payments</h1><p className="lead">Review payment activity and approvals for Caldermere Ltd.</p></div></header>
    <section className="payment-summary" aria-labelledby="payment-summary-heading">
      <h2 id="payment-summary-heading" className="visually-hidden">Payment summary</h2>
      <div className="payment-summary-primary"><span>Pending</span><strong>{paymentSummary.totalPending}</strong><p>{paymentSummary.awaitingApproval} awaiting approval · {paymentSummary.scheduled} scheduled · {paymentSummary.processing} processing</p><p>{approvalSummary.outstandingApprovalActions} approval actions outstanding across {approvalSummary.paymentsAwaitingApproval} payments</p></div>
      <div className="payment-summary-secondary"><div><span>Failed</span><strong>{paymentSummary.failed}</strong></div><div><span>Completed today</span><strong>{paymentSummary.completedToday}</strong></div></div>
    </section>
    <section className="payment-list" aria-labelledby="payment-list-heading"><div className="section-heading"><div><h2 id="payment-list-heading">Payment activity</h2><p>{payments.length} payments</p></div></div><PaymentsDataTable payments={payments} /></section>
  </main></ProductShell>;
}
