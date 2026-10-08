"use client";

import { useMemo, useState } from "react";
import { createDataTableRowModel, DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import type { BankTransaction } from "../../../src/finance/transactions";
import { formatPostedDate, getTransactionAmounts } from "../../../src/presentation/accountDetail";
import { formatMinorCurrencyAmount } from "../../../src/presentation/money";
import { MobileTableSortControls } from "../../MobileTableSortControls";

type TransactionHistoryProps = { transactions: BankTransaction[] };

function TransactionContext({ transaction }: { transaction: BankTransaction }) {
  return <><span className="transaction-description">{transaction.description}</span>{transaction.counterpartyName && <span className="transaction-secondary">{transaction.counterpartyName}</span>}{transaction.reference && <span className="transaction-reference">Reference: {transaction.reference}</span>}</>;
}

export const transactionColumns: readonly DataTableColumn<BankTransaction>[] = [
  {
    id: "date",
    label: "Date",
    header: "Date",
    nowrap: true,
    cell: ({ row }) => <span className="transaction-date">{formatPostedDate(row.bookedAt)}</span>,
    sort: { value: row => row.bookedAt },
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
    cell: () => <span className="transaction-status">Booked</span>,
    sort: { value: () => "booked" },
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
      const { moneyOutMinor } = getTransactionAmounts(row);
      return moneyOutMinor === undefined ? "—" : formatMinorCurrencyAmount(moneyOutMinor, row.currency);
    },
    sort: { value: row => getTransactionAmounts(row).moneyOutMinor },
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
      const { moneyInMinor } = getTransactionAmounts(row);
      return moneyInMinor === undefined ? "—" : formatMinorCurrencyAmount(moneyInMinor, row.currency);
    },
    sort: { value: row => getTransactionAmounts(row).moneyInMinor },
  },
];

export function createTransactionsPresentationRowModel(
  transactions: readonly BankTransaction[],
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
      {rowModel.sortedRows.map((transaction) => { const { moneyInMinor, moneyOutMinor } = getTransactionAmounts(transaction); const amountMinor = moneyInMinor ?? moneyOutMinor ?? 0; return <li className="transaction-card" key={transaction.id}><div className="transaction-card-header"><div className="transaction-copy"><TransactionContext transaction={transaction} /></div><strong className="financial-value">{moneyOutMinor !== undefined ? "−" : "+"}{formatMinorCurrencyAmount(amountMinor, transaction.currency)}</strong></div><dl className="transaction-card-meta"><div><dt>Date</dt><dd>{formatPostedDate(transaction.bookedAt)}</dd></div><div><dt>Status</dt><dd className="transaction-status">Booked</dd></div></dl></li>; })}
    </ol>
  </>;
}
