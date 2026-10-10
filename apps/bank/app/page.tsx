import Link from "next/link";
import { Input } from "@johnshandux/ledger-design-system";
import "./accounts.css";
import { getBankAccountOverview } from "../src/finance/accounts";
import { formatMinorCurrencyAmount } from "../src/presentation/money";
import { ProductShell } from "./ProductShell";
import { AccountsDataTable } from "./AccountsDataTable";

export default function Home() {
  const { accounts, liquidity } = getBankAccountOverview();

  return (
    <ProductShell activeRoute="accounts">
      <main className="page">
        <div className="page-header">
          <div>
            <h1>Accounts</h1>
            <p className="lead">Overview of company accounts and balances.</p>
          </div>

          <div className="page-actions">
            <Input
              label="Search accounts"
              visuallyHiddenLabel
              placeholder="Search accounts"
              type="search"
            />
            {process.env.NODE_ENV !== "production" && (
              <Link className="ledger-button ledger-button--primary primary-action" href="/payments/new">Make a payment</Link>
            )}
          </div>
        </div>

        <section className="summary">
          <div className="summary-card">
            <div className="summary-label">Total available</div>
            <div className="summary-values">
              {liquidity.byCurrency.map((total) => <div className="summary-value" key={total.currency}>{formatMinorCurrencyAmount(total.availableBalanceMinor, total.currency)}</div>)}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Total current</div>
            <div className="summary-values">
              {liquidity.byCurrency.map((total) => <div className="summary-value" key={total.currency}>{formatMinorCurrencyAmount(total.ledgerBalanceMinor, total.currency)}</div>)}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Accounts</div>
            <div className="summary-value">{accounts.length}</div>
          </div>
        </section>

        <section className="accounts-list">
          <AccountsDataTable accounts={accounts} />
        </section>
      </main>
    </ProductShell>
  );
}
