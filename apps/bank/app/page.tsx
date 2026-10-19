import Link from "next/link";
import "./accounts.css";
import { getBankAccountOverview } from "../src/finance/accounts";
import { ProductShell } from "./ProductShell";
import { AccountsDataTable } from "./AccountsDataTable";
import { FinancialSummary } from "./FinancialSummary";

export default function Home() {
  const { accounts } = getBankAccountOverview();

  return (
    <ProductShell activeRoute="accounts">
      <div className="page">
        <header className="accounts-page-header">
          <h1>Accounts</h1>
          <Link className="ledger-button ledger-button--primary primary-action" href="/payments/new">New payment</Link>
        </header>

        <FinancialSummary />

        <section className="accounts-list">
          <AccountsDataTable accounts={accounts} />
        </section>
      </div>
    </ProductShell>
  );
}
