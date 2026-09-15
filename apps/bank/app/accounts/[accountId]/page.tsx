import Link from "next/link";
import { notFound } from "next/navigation";
import "../../accounts.css";
import { getAccountAccessForProfile, getActiveBusinessProfile, getTransactionsForProfileAccount } from "../../../src/data/selectors";
import { formatAccountType, formatCurrency, formatUpdatedAt } from "../../../src/presentation/accountDetail";
import { TransactionHistory } from "./TransactionHistory";

export default async function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const activeProfile = getActiveBusinessProfile();
  const access = activeProfile ? getAccountAccessForProfile(activeProfile.id, accountId) : { status: "not-authorised" as const };

  if (access.status === "not-found") notFound();
  if (access.status === "not-authorised") {
    return <main className="state-page"><div className="state-panel"><p className="eyebrow">Account access</p><h1>You do not have access to accounts</h1><p>Ask a business administrator for permission to view account information.</p><Link href="/" className="text-link">Return to accounts</Link></div></main>;
  }

  const { account, canViewTransactions } = access;
  const transactions = canViewTransactions && activeProfile ? getTransactionsForProfileAccount(activeProfile.id, account.id) ?? [] : undefined;

  return (
    <div className="product-shell">
      <header className="shell-header">
        <Link href="/" className="brand">Ledger Bank</Link>

        <nav className="primary-nav" aria-label="Primary">
          <ul>
            <li><Link href="/" className="nav-item selected" aria-current="page">Accounts</Link></li>
            <li><span className="nav-item">Payments</span></li>
            <li><span className="nav-item">Reporting</span></li>
          </ul>
        </nav>

        <div className="profile">J. Finance</div>
      </header>

      <main className="page account-page">
        <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link href="/">Accounts</Link></li><li aria-current="page">{account.name}</li></ol></nav>

        <header className="account-header">
          <div>
            <p className="eyebrow">{formatAccountType(account.type)} · {account.status}</p>
            <h1>{account.name}</h1>
            {account.description && <p className="lead">{account.description}</p>}
          </div>
        </header>

        <section className="balance-summary" aria-labelledby="balances-heading">
          <h2 id="balances-heading" className="visually-hidden">Balances</h2>
          <div className="primary-balance"><span>Available balance</span><strong className="financial-value">{formatCurrency(account.availableBalance, account.currency)}</strong></div>
          <div className="secondary-balance"><span>Current balance</span><strong className="financial-value">{formatCurrency(account.currentBalance, account.currency)}</strong></div>
          <p>Updated {formatUpdatedAt(account.balancesUpdatedAt)}</p>
        </section>

        <section className="account-details" aria-labelledby="details-heading">
          <h2 id="details-heading">Account details</h2>
          <dl><div><dt>Account number</dt><dd className="identifier">{account.accountNumber}</dd></div><div><dt>Sort code</dt><dd className="identifier">{account.sortCode}</dd></div><div><dt>Account type</dt><dd>{formatAccountType(account.type)}</dd></div><div><dt>Currency</dt><dd>{account.currency}</dd></div></dl>
        </section>

        <section className="transactions" aria-labelledby="transactions-heading">
          <div className="section-heading"><div><h2 id="transactions-heading">Transactions</h2>{transactions && <p>{transactions.length} recent transaction{transactions.length === 1 ? "" : "s"}</p>}</div></div>
          {transactions === undefined ? <div className="permission-state"><h3>You do not have permission to view transactions</h3><p>Account balances and details remain available for your role.</p></div> : <TransactionHistory transactions={transactions} />}
        </section>
      </main>
    </div>
  );
}
