import "../accounts.css";
import "./payments.css";
import Link from "next/link";
import { ProductShell } from "../ProductShell";
import { EffectivePaymentsOverview } from "./EffectivePaymentsList";

export default function PaymentsPage() {
  return <ProductShell activeRoute="payments"><main className="page payments-page">
    <header className="page-header"><div><h1>Payments</h1><p className="lead">Review payment activity and approvals for Caldermere Ltd.</p></div>{process.env.NODE_ENV !== "production" && <Link className="ledger-button ledger-button--primary payments-new-link" href="/payments/new">New payment</Link>}</header>
    <EffectivePaymentsOverview />
  </main></ProductShell>;
}
