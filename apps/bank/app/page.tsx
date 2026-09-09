import { Button, Input } from "@johnshandux/ledger-design-system";
import "./accounts.css";
import { accounts } from "./accountsData";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(v);

export default function Home() {
  const totalCurrent = accounts.reduce((s, a) => s + a.currentBalance, 0);
  const totalAvailable = accounts.reduce((s, a) => s + a.availableBalance, 0);

  return (
    <div className="product-shell">
      <header className="shell-header">
        <div className="brand">Ledger Bank</div>

        <nav className="primary-nav" aria-label="Primary">
          <ul>
            <li className="nav-item selected">Accounts</li>
            <li className="nav-item">Payments</li>
            <li className="nav-item">Reporting</li>
          </ul>
        </nav>

        <div className="profile">J. Finance</div>
      </header>

      <main className="page">
        <div className="page-header">
          <div>
            <h1>Accounts</h1>
            <p className="lead">Overview of company accounts and balances.</p>
          </div>

          <div className="page-actions">
            <Input label="Search accounts" placeholder="Search account name or number" />
            <Button className="primary-action">Make a payment</Button>
          </div>
        </div>

        <section className="summary">
          <div className="summary-card">
            <div className="summary-label">Total available</div>
            <div className="summary-value">{fmt(totalAvailable)}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Total current</div>
            <div className="summary-value">{fmt(totalCurrent)}</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Accounts</div>
            <div className="summary-value">{accounts.length}</div>
          </div>
        </section>

        <section className="accounts-list">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Number / Sort</th>
                <th>Type</th>
                <th className="numeric">Current</th>
                <th className="numeric">Available</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} tabIndex={0} className="row-interactive">
                  <td>
                    <div className="acc-name">{a.name}</div>
                    <div className="acc-sub">{a.description}</div>
                  </td>
                  <td>
                    <div className="mono">{a.accountNumber}</div>
                    <div className="mono">{a.sortCode}</div>
                  </td>
                  <td>{a.type}</td>
                  <td className="numeric">{fmt(a.currentBalance)}</td>
                  <td className="numeric">{fmt(a.availableBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="accounts-mobile">
            {accounts.map((a) => (
              <article key={a.id} className="acc-card" tabIndex={0}>
                <div className="acc-top">
                  <div>
                    <div className="acc-name">{a.name}</div>
                    <div className="acc-sub">{a.type} • {a.accountNumber}</div>
                  </div>
                  <div className="mono">{fmt(a.availableBalance)}</div>
                </div>

                <div className="acc-meta">
                  <div>Current: <span className="mono">{fmt(a.currentBalance)}</span></div>
                  <div>Sort: <span className="mono">{a.sortCode}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}