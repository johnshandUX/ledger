"use client";

import { useState } from "react";
import Link from "next/link";
import { createDataTableRowModel, DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import type { BankAccount } from "../src/finance/accounts";
import { formatAccountType } from "../src/presentation/accountDetail";
import { formatMinorCurrencyAmount } from "../src/presentation/money";
import { MobileTableSortControls } from "./MobileTableSortControls";

export const accountColumns: readonly DataTableColumn<BankAccount>[] = [
  {
    id: "account",
    label: "Account",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <div className="acc-name"><Link className="ledger-link" href={`/accounts/${row.id}`}>{row.name}</Link></div>
        <div className="acc-sub">{row.status}</div>
      </div>
    ),
    sort: { value: row => row.name },
  },
  {
    id: "accountNumber",
    label: "Account number",
    header: "Number / Sort",
    nowrap: true,
    cell: ({ row }) => <div><div className="mono">{row.accountNumber ?? "—"}</div><div className="mono">{row.sortCode ?? "—"}</div></div>,
  },
  {
    id: "type",
    label: "Account type",
    header: "Type",
    cell: ({ row }) => formatAccountType(row.accountType),
    sort: { value: row => formatAccountType(row.accountType) },
  },
  {
    id: "currentBalance",
    label: "Current balance",
    header: "Current",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => formatMinorCurrencyAmount(row.ledgerBalanceMinor, row.currency),
    sort: { value: row => row.ledgerBalanceMinor },
  },
  {
    id: "availableBalance",
    label: "Available balance",
    header: "Available",
    align: "right",
    headerAlign: "right",
    numeric: true,
    nowrap: true,
    cell: ({ row }) => formatMinorCurrencyAmount(row.availableBalanceMinor, row.currency),
    sort: { value: row => row.availableBalanceMinor },
  },
];

const accountPageSizeOptions = [10, 20, 50] as const;
const accountSortOptions = [
  { columnId: "account", label: "Account" },
  { columnId: "type", label: "Account type" },
  { columnId: "currentBalance", label: "Current balance" },
  { columnId: "availableBalance", label: "Available balance" },
] as const;

export function createAccountsPresentationRowModel(accounts: readonly BankAccount[], state: DataTableState) {
  return createDataTableRowModel({ rows: accounts, columns: accountColumns, state, pageSizeOptions: accountPageSizeOptions });
}

export function AccountsDataTable({ accounts }: { accounts: readonly BankAccount[] }) {
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
          itemLabel={{ singular: "account", plural: "accounts" }}
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
                <div className="acc-sub">{formatAccountType(account.accountType)} • {account.accountNumber ?? "—"} • {account.status}</div>
              </div>
              <div className="financial-value">{formatMinorCurrencyAmount(account.availableBalanceMinor, account.currency)}</div>
            </div>

            <div className="acc-meta">
              <div>Current: <span className="financial-value">{formatMinorCurrencyAmount(account.ledgerBalanceMinor, account.currency)}</span></div>
              <div>Sort: <span className="mono">{account.sortCode ?? "—"}</span></div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
