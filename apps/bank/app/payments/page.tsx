import "../accounts.css";
import "./payments.css";
import Link from "next/link";
import { ProductShell } from "../ProductShell";
import { EffectivePaymentsOverview } from "./EffectivePaymentsList";

export default function PaymentsPage() {
  return <ProductShell activeRoute="payments"><div className="page payments-page">
    <header className="page-header payments-page-header"><h1>Payments</h1><Link className="ledger-button ledger-button--primary payments-new-link" href="/payments/new">New payment</Link></header>
    <EffectivePaymentsOverview />
  </div></ProductShell>;
}
