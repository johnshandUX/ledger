"use client";

import { useMemo, useState } from "react";
import { formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import { createDataTableRowModel, DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import type { Transaction } from "../../../src/domain/Transaction";
import { formatPostedDate, getTransactionAmounts } from "../../../src/presentation/accountDetail";
import { MobileTableSortControls } from "../../MobileTableSortControls";

type TransactionHistoryProps = { transactions: Transaction[] };

function TransactionContext({ transaction }: { transaction: Transaction }) {
  return <><span className="transaction-description">{transaction.description}</span>{transaction.counterpartyName && <span className="transaction-secondary">{transaction.counterpartyName}</span>}{transaction.reference && <span className="transaction-reference">Reference: {transaction.reference}</span>}</>;
}

export const transactionColumns: readonly DataTableColumn<Transaction>[] = [
  {
    id: "date",
    label: "Date",
    header: "Date",
    nowrap: true,
    cell: ({ row }) => <span className="transaction-date">{formatPostedDate(row.postedAt)}</span>,
    sort: { value: row => new Date(row.postedAt) },
  },
  {
    id: "transaction",
    label: "Transaction",
    header: "Transaction",
    cell: ({ row }) => <div className="transaction-copy"><TransactionContext transaction={row} /></div>,
  },
  {
    id: "status",
    label: "Status",
    header: "Status",
    cell: ({ row }) => <span className="transaction-status">{row.status}</span>,
    sort: { value: row => row.status },
  },
  {
    id: "moneyOut",
    label: "Money out",
    header: "Money out",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => {
      const { moneyOut } = getTransactionAmounts(row);
      return moneyOut === undefined ? "—" : formatCurrencyAmount(moneyOut, row.currency);
    },
    sort: { value: row => getTransactionAmounts(row).moneyOut },
  },
  {
    id: "moneyIn",
    label: "Money in",
    header: "Money in",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => {
      const { moneyIn } = getTransactionAmounts(row);
      return moneyIn === undefined ? "—" : formatCurrencyAmount(moneyIn, row.currency);
    },
    sort: { value: row => getTransactionAmounts(row).moneyIn },
  },
  {
    id: "balance",
    label: "Balance",
    header: "Balance",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => row.balanceAfter === undefined ? "—" : formatCurrencyAmount(row.balanceAfter, row.currency),
    sort: { value: row => row.balanceAfter },
  },
];

export function createTransactionsPresentationRowModel(
  transactions: readonly Transaction[],
  state: DataTableState,
  pageSizeOptions: readonly number[],
) {
  return createDataTableRowModel({ rows: transactions, columns: transactionColumns, state, pageSizeOptions });
}

const transactionSortOptions = [
  { columnId: "date", label: "Date" },
  { columnId: "status", label: "Status" },
  { columnId: "moneyOut", label: "Money out" },
  { columnId: "moneyIn", label: "Money in" },
  { columnId: "balance", label: "Balance" },
] as const;

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) return <div className="empty-state"><h3>No transactions yet</h3><p>Transactions will appear here when activity is recorded on this account.</p></div>;

  return <TransactionHistoryWithRows transactions={transactions} />;
}

function TransactionHistoryWithRows({ transactions }: TransactionHistoryProps) {
  // V1 keeps the complete product-owned mobile list and desktop table equivalent. Governed
  // transaction paging can be introduced later when both responsive representations support it.
  const pageSizeOptions = useMemo(() => [transactions.length], [transactions.length]);
  const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: transactions.length });
  const rowModel = createTransactionsPresentationRowModel(transactions, state, pageSizeOptions);

  return <>
    <div className="transactions-desktop">
      <DataTable
        caption="Transactions for this account"
        rows={transactions}
        columns={transactionColumns}
        getRowId={transaction => transaction.id}
        pageSizeOptions={pageSizeOptions}
        state={state}
        onStateChange={setState}
      />
    </div>
    <ol className="transactions-mobile" aria-label="Transactions for this account">
      <li className="transactions-mobile-controls"><MobileTableSortControls label="Sort transactions by" options={transactionSortOptions} state={state} onStateChange={setState} /></li>
      {rowModel.sortedRows.map((transaction) => { const { moneyIn, moneyOut } = getTransactionAmounts(transaction); const amount = moneyIn ?? moneyOut; return <li className="transaction-card" key={transaction.id}><div className="transaction-card-header"><div className="transaction-copy"><TransactionContext transaction={transaction} /></div><strong className="financial-value">{moneyOut !== undefined ? "−" : "+"}{formatCurrencyAmount(amount ?? 0, transaction.currency)}</strong></div><dl className="transaction-card-meta"><div><dt>Date</dt><dd>{formatPostedDate(transaction.postedAt)}</dd></div><div><dt>Status</dt><dd className="transaction-status">{transaction.status}</dd></div><div><dt>Balance</dt><dd className="financial-value">{transaction.balanceAfter === undefined ? "—" : formatCurrencyAmount(transaction.balanceAfter, transaction.currency)}</dd></div></dl></li>; })}
    </ol>
  </>;
}
