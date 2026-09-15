import { Button, formatCurrencyAmount, Input, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@johnshandux/ledger-design-system";
import "./accounts.css";
import Link from "next/link";
import { getActiveBusinessProfile, getAccountsForProfile } from "../src/data/selectors";
import { formatAccountType } from "../src/presentation/accountDetail";
import { getBalanceTotalsByCurrency } from "../src/presentation/accountOverview";
import { ProductShell } from "./ProductShell";

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
            <Input label="Search accounts" placeholder="Search account name or number" />
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
          <Table className="accounts-table">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Account</TableHeaderCell>
                <TableHeaderCell>Number / Sort</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell align="right">Current</TableHeaderCell>
                <TableHeaderCell align="right">Available</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="acc-name"><Link className="ledger-link" href={`/accounts/${a.id}`}>{a.name}</Link></div>
                    <div className="acc-sub">{a.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="mono">{a.accountNumber}</div>
                    <div className="mono">{a.sortCode}</div>
                  </TableCell>
                  <TableCell>{formatAccountType(a.type)}</TableCell>
                  <TableCell className="financial-value" align="right">{formatCurrencyAmount(a.currentBalance, a.currency)}</TableCell>
                  <TableCell className="financial-value" align="right">{formatCurrencyAmount(a.availableBalance, a.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="accounts-mobile">
            {accounts.map((a) => (
              <article key={a.id} className="acc-card">
                <div className="acc-top">
                  <div>
                    <div className="acc-name"><Link className="ledger-link" href={`/accounts/${a.id}`}>{a.name}</Link></div>
                    <div className="acc-sub">{formatAccountType(a.type)} • {a.accountNumber}</div>
                  </div>
                  <div className="financial-value">{formatCurrencyAmount(a.availableBalance, a.currency)}</div>
                </div>

                <div className="acc-meta">
                  <div>Current: <span className="financial-value">{formatCurrencyAmount(a.currentBalance, a.currency)}</span></div>
                  <div>Sort: <span className="mono">{a.sortCode}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </ProductShell>
  );
}
