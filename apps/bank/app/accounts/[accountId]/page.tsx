import Link from "next/link";
import { notFound } from "next/navigation";
import "../../accounts.css";
import { getAccount, getTransactionsForAccount } from "../../../src/data/selectors";

const formatCurrency = (v: number, currency?: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency ?? "GBP" }).format(v);

export default function AccountPage({ params }: { params: { accountId: string } }) {
  const { accountId } = params;
  const account = getAccount(accountId);

  if (!account) return notFound();

  const transactions = getTransactionsForAccount(accountId);

  return (
    <div className="product-shell">
      <header className="shell-header">
        <div className="brand">Ledger Bank</div>

        <nav className="primary-nav" aria-label="Primary">
          <ul>
            <li className="nav-item">Accounts</li>
            <li className="nav-item">Payments</li>
            <li className="nav-item">Reporting</li>
          </ul>
        </nav>

        <div className="profile">J. Finance</div>
      </header>

      <main className="page">
        <div className="page-header">
          <div>
            <h1>Account detail</h1>
            <p className="lead">Details and transactions for the account.</p>
          </div>

          <div className="page-actions">
            <Link href="/" className="primary-action">Back to accounts</Link>
          </div>
        </div>

        <section className="account-detail">
          <div className="summary-card">
            <div className="summary-label">Account</div>
            <div className="summary-value">{account.name}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Type</div>
            <div className="summary-value">{account.type}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Number / Sort</div>
            <div className="summary-value mono">{account.accountNumber} • {account.sortCode}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Available</div>
            <div className="summary-value">{formatCurrency(account.availableBalance, account.currency)}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Current</div>
            <div className="summary-value">{formatCurrency(account.currentBalance, account.currency)}</div>
          </div>
        </section>

        <section className="transactions">
          <h2>Transactions</h2>
          {transactions.length === 0 ? (
            <div className="lead">No transactions for this account.</div>
          ) : (
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="numeric">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(t.date))}</td>
                    <td>{t.description}</td>
                    <td className="numeric">{formatCurrency(t.amount, t.currency ?? account.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
