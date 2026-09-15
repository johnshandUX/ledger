import { formatCurrencyAmount, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@johnshandux/ledger-design-system";
import type { Transaction } from "../../../src/domain/Transaction";
import { formatPostedDate, getTransactionAmounts } from "../../../src/presentation/accountDetail";

type TransactionHistoryProps = { transactions: Transaction[] };

function TransactionContext({ transaction }: { transaction: Transaction }) {
  return <><span className="transaction-description">{transaction.description}</span>{transaction.counterpartyName && <span className="transaction-secondary">{transaction.counterpartyName}</span>}{transaction.reference && <span className="transaction-reference">Reference: {transaction.reference}</span>}</>;
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) return <div className="empty-state"><h3>No transactions yet</h3><p>Transactions will appear here when activity is recorded on this account.</p></div>;

  return <>
    <div className="transactions-desktop">
      <Table ariaLabel="Transactions for this account">
        <caption className="visually-hidden">Transactions for this account, newest first</caption>
        <TableHead><TableRow><TableHeaderCell>Date</TableHeaderCell><TableHeaderCell>Transaction</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell align="right">Money out</TableHeaderCell><TableHeaderCell align="right">Money in</TableHeaderCell><TableHeaderCell align="right">Balance</TableHeaderCell></TableRow></TableHead>
        <TableBody>{transactions.map((transaction) => { const { moneyIn, moneyOut } = getTransactionAmounts(transaction); return <TableRow key={transaction.id}><TableCell className="transaction-date">{formatPostedDate(transaction.postedAt)}</TableCell><TableCell className="transaction-copy"><TransactionContext transaction={transaction} /></TableCell><TableCell><span className="transaction-status">{transaction.status}</span></TableCell><TableCell className="financial-value" align="right">{moneyOut === undefined ? "—" : formatCurrencyAmount(moneyOut, transaction.currency)}</TableCell><TableCell className="financial-value" align="right">{moneyIn === undefined ? "—" : formatCurrencyAmount(moneyIn, transaction.currency)}</TableCell><TableCell className="financial-value" align="right">{transaction.balanceAfter === undefined ? "—" : formatCurrencyAmount(transaction.balanceAfter, transaction.currency)}</TableCell></TableRow>; })}</TableBody>
      </Table>
    </div>
    <ol className="transactions-mobile" aria-label="Transactions for this account, newest first">
      {transactions.map((transaction) => { const { moneyIn, moneyOut } = getTransactionAmounts(transaction); const amount = moneyIn ?? moneyOut; return <li className="transaction-card" key={transaction.id}><div className="transaction-card-header"><div className="transaction-copy"><TransactionContext transaction={transaction} /></div><strong className="financial-value">{moneyOut !== undefined ? "−" : "+"}{formatCurrencyAmount(amount ?? 0, transaction.currency)}</strong></div><dl className="transaction-card-meta"><div><dt>Date</dt><dd>{formatPostedDate(transaction.postedAt)}</dd></div><div><dt>Status</dt><dd className="transaction-status">{transaction.status}</dd></div><div><dt>Balance</dt><dd className="financial-value">{transaction.balanceAfter === undefined ? "—" : formatCurrencyAmount(transaction.balanceAfter, transaction.currency)}</dd></div></dl></li>; })}
    </ol>
  </>;
}
