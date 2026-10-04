import { Button, formatCurrencyAmount, Input } from "@johnshandux/ledger-design-system";
import "./accounts.css";
import { getActiveBusinessProfile, getAccountsForProfile } from "../src/data/selectors";
import { getBalanceTotalsByCurrency } from "../src/presentation/accountOverview";
import { ProductShell } from "./ProductShell";
import { AccountsDataTable } from "./AccountsDataTable";

const activeProfile = getActiveBusinessProfile();
const accounts = activeProfile ? getAccountsForProfile(activeProfile.id) : [];

export default function Home() {
  const balanceTotals = getBalanceTotalsByCurrency(accounts);

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
            <Button className="primary-action">Make a payment</Button>
          </div>
        </div>

        <section className="summary">
          <div className="summary-card">
            <div className="summary-label">Total available</div>
            <div className="summary-values">
              {balanceTotals.map((total) => <div className="summary-value" key={total.currency}>{formatCurrencyAmount(total.available, total.currency)}</div>)}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Total current</div>
            <div className="summary-values">
              {balanceTotals.map((total) => <div className="summary-value" key={total.currency}>{formatCurrencyAmount(total.current, total.currency)}</div>)}
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
