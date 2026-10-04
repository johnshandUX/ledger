"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import { createDataTableRowModel, DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import type { Account } from "../src/domain/Account";
import { formatAccountType } from "../src/presentation/accountDetail";
import { MobileTableSortControls } from "./MobileTableSortControls";

export const accountColumns: readonly DataTableColumn<Account>[] = [
  {
    id: "account",
    label: "Account",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <div className="acc-name"><Link className="ledger-link" href={`/accounts/${row.id}`}>{row.name}</Link></div>
        {row.description && <div className="acc-sub">{row.description}</div>}
      </div>
    ),
    sort: { value: row => row.name },
  },
  {
    id: "accountNumber",
    label: "Account number",
    header: "Number / Sort",
    nowrap: true,
    cell: ({ row }) => <div><div className="mono">{row.accountNumber}</div><div className="mono">{row.sortCode}</div></div>,
  },
  {
    id: "type",
    label: "Account type",
    header: "Type",
    cell: ({ row }) => formatAccountType(row.type),
    sort: { value: row => formatAccountType(row.type) },
  },
  {
    id: "currentBalance",
    label: "Current balance",
    header: "Current",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => formatCurrencyAmount(row.currentBalance, row.currency),
    sort: { value: row => row.currentBalance },
  },
  {
    id: "availableBalance",
    label: "Available balance",
    header: "Available",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => formatCurrencyAmount(row.availableBalance, row.currency),
    sort: { value: row => row.availableBalance },
  },
];

const accountPageSizeOptions = [10, 20, 50] as const;
const accountSortOptions = [
  { columnId: "account", label: "Account" },
  { columnId: "type", label: "Account type" },
  { columnId: "currentBalance", label: "Current balance" },
  { columnId: "availableBalance", label: "Available balance" },
] as const;

export function createAccountsPresentationRowModel(accounts: readonly Account[], state: DataTableState) {
  return createDataTableRowModel({ rows: accounts, columns: accountColumns, state, pageSizeOptions: accountPageSizeOptions });
}

export function AccountsDataTable({ accounts }: { accounts: readonly Account[] }) {
  const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: 20 });
  const rowModel = createAccountsPresentationRowModel(accounts, state);

  return (
    <>
      <div className="accounts-table">
        <DataTable
          caption="Accounts and balances"
          rows={accounts}
          columns={accountColumns}
          getRowId={account => account.id}
          pageSizeOptions={accountPageSizeOptions}
          state={state}
          onStateChange={setState}
          emptyState={{ title: "No accounts to display" }}
        />
      </div>

      <div className="accounts-mobile">
        <MobileTableSortControls label="Sort accounts by" options={accountSortOptions} state={state} onStateChange={setState} />
        {rowModel.sortedRows.map(account => (
          <article key={account.id} className="acc-card">
            <div className="acc-top">
              <div>
                <div className="acc-name"><Link className="ledger-link" href={`/accounts/${account.id}`}>{account.name}</Link></div>
                <div className="acc-sub">{formatAccountType(account.type)} • {account.accountNumber}</div>
              </div>
              <div className="financial-value">{formatCurrencyAmount(account.availableBalance, account.currency)}</div>
            </div>

            <div className="acc-meta">
              <div>Current: <span className="financial-value">{formatCurrencyAmount(account.currentBalance, account.currency)}</span></div>
              <div>Sort: <span className="mono">{account.sortCode}</span></div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
