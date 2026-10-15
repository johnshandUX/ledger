"use client";

import Link from "next/link";
import { Button } from "@johnshandux/ledger-design-system";

import { getLatestBalanceForAccount } from "../../../src/finance/accounts";
import type { BankTransaction } from "../../../src/finance/transactions";
import { getPaymentSourceEligibility } from "../../../src/finance/payment-sources";
import { formatAccountType, formatUpdatedAt } from "../../../src/presentation/accountDetail";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { useEffectiveAccountById, useEffectiveBalances } from "../../useBankEffectiveState";
import { TransactionHistory } from "./TransactionHistory";

type AccountDetailsExperienceProps = Readonly<{
  accountId: string;
  transactions: readonly BankTransaction[];
}>;

export function AccountDetailsExperience({
  accountId,
  transactions,
}: AccountDetailsExperienceProps) {
  const account = useEffectiveAccountById(accountId);
  const balances = useEffectiveBalances();
  const balance = getLatestBalanceForAccount(balances, accountId);

  if (!account || !balance) {
    return (
      <>
        <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/">Accounts</Link></li><li aria-current="page">Account unavailable</li></ol></nav>
        <section className="state-panel account-unavailable">
          <h1>Account unavailable</h1>
          <p>This account is no longer available in the current demo session.</p>
        </section>
      </>
    );
  }

  const eligibility = getPaymentSourceEligibility(account);
  const paymentExplanationId = `payment-eligibility-${account.id}`;

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/">Accounts</Link></li><li aria-current="page">{account.name}</li></ol></nav>

      <header className="account-header">
        <p className="eyebrow">Account details</p>
        <h1>{account.name}</h1>
      </header>

      <dl className="account-identity-details">
        <div><dt>Account type</dt><dd>{formatAccountType(account.accountType)}</dd></div>
        <div><dt>Currency</dt><dd>{account.currency}</dd></div>
        {account.sortCode && <div><dt>Sort code</dt><dd className="account-identifier">{account.sortCode}</dd></div>}
        {account.accountNumber && <div><dt>Account number</dt><dd className="account-identifier">{account.accountNumber}</dd></div>}
        {account.status !== "active" && <div><dt>Status</dt><dd className="account-status">{account.status}</dd></div>}
      </dl>

      <div className="account-payment-action">
        {eligibility.eligible ? (
          <Link
            className="ledger-button ledger-button--primary account-payment-link"
            href={`/payments/new?sourceAccountId=${encodeURIComponent(account.id)}`}
          >
            Make a payment
          </Link>
        ) : (
          <>
            <Button type="button" className="account-payment-button" disabled aria-describedby={paymentExplanationId}>
              Make a payment
            </Button>
            <p id={paymentExplanationId}>{eligibility.reason}</p>
          </>
        )}
      </div>

      <section className="balance-summary" aria-labelledby="balances-heading">
        <h2 id="balances-heading" className="visually-hidden">Financial position</h2>
        <div className="primary-balance"><span>Available balance</span><strong className="financial-value">{formatMinorCurrencyAmount(balance.availableBalanceMinor, account.currency)}</strong></div>
        <div className="secondary-balance"><span>Current balance</span><strong className="financial-value">{formatMinorCurrencyAmount(balance.ledgerBalanceMinor, account.currency)}</strong></div>
        <p>Updated {formatUpdatedAt(balance.asOf)}</p>
      </section>

      <section className="transactions" aria-labelledby="transactions-heading">
        <div className="section-heading"><div><h2 id="transactions-heading">Transactions</h2><p>{transactions.length} recent transaction{transactions.length === 1 ? "" : "s"}</p></div></div>
        <TransactionHistory transactions={[...transactions]} />
      </section>
    </>
  );
}
