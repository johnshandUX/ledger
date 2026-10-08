import Link from "next/link";
import { notFound } from "next/navigation";
import "../../accounts.css";
import { getBankAccountById } from "../../../src/finance/accounts";
import { getBankTransactionsForAccount } from "../../../src/finance/transactions";
import { formatAccountType, formatUpdatedAt } from "../../../src/presentation/accountDetail";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { ProductShell } from "../../ProductShell";
import { TransactionHistory } from "./TransactionHistory";

export default async function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const account = getBankAccountById(accountId);
  if (!account) notFound();
  const transactions = getBankTransactionsForAccount(account.id);

  return (
    <ProductShell activeRoute="accounts">
      <main className="page account-page">
        <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/">Accounts</Link></li><li aria-current="page">{account.name}</li></ol></nav>

        <header className="account-header">
          <div>
            <p className="eyebrow">{formatAccountType(account.accountType)} · {account.status}</p>
            <h1>{account.name}</h1>
          </div>
        </header>

        <section className="balance-summary" aria-labelledby="balances-heading">
          <h2 id="balances-heading" className="visually-hidden">Balances</h2>
          <div className="primary-balance"><span>Available balance</span><strong className="financial-value">{formatMinorCurrencyAmount(account.availableBalanceMinor, account.currency)}</strong></div>
          <div className="secondary-balance"><span>Current balance</span><strong className="financial-value">{formatMinorCurrencyAmount(account.ledgerBalanceMinor, account.currency)}</strong></div>
          <p>Updated {formatUpdatedAt(account.balanceAsOf)}</p>
        </section>

        <section className="account-details" aria-labelledby="details-heading">
          <h2 id="details-heading">Account details</h2>
          <dl><div><dt>Account number</dt><dd className="identifier">{account.accountNumber ?? "—"}</dd></div><div><dt>Sort code</dt><dd className="identifier">{account.sortCode ?? "—"}</dd></div><div><dt>Account type</dt><dd>{formatAccountType(account.accountType)}</dd></div><div><dt>Currency</dt><dd>{account.currency}</dd></div></dl>
        </section>

        <section className="transactions" aria-labelledby="transactions-heading">
          <div className="section-heading"><div><h2 id="transactions-heading">Transactions</h2><p>{transactions.length} recent transaction{transactions.length === 1 ? "" : "s"}</p></div></div>
          <TransactionHistory transactions={transactions} />
        </section>
      </main>
    </ProductShell>
  );
}
