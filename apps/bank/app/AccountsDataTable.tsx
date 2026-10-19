"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Input } from "@johnshandux/ledger-design-system";
import { createDataTableRowModel, DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import type { BankAccount } from "../src/finance/accounts";
import { formatAccountType } from "../src/presentation/accountDetail";
import { formatMinorCurrencyAmount } from "../src/presentation/money";
import { MobileTableSortControls } from "./MobileTableSortControls";
import { useEffectiveAccounts, useEffectiveBalances } from "./useBankEffectiveState";

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
    id: "sortCode",
    label: "Sort code",
    header: "Sort code",
    nowrap: true,
    cell: ({ row }) => <span className="account-identifier">{row.sortCode ?? "—"}</span>,
  },
  {
    id: "accountNumber",
    label: "Account number",
    header: "Account number",
    nowrap: true,
    cell: ({ row }) => <span className="account-identifier">{row.accountNumber ?? "—"}</span>,
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
  const effectiveAccountRecords = useEffectiveAccounts();
  const effectiveBalances = useEffectiveBalances();
  const effectiveAccounts = useMemo(() => {
    const sourceById = new Map(accounts.map(account => [account.id, account]));
    const latestBalanceByAccountId = new Map<string, (typeof effectiveBalances)[number]>();

    effectiveBalances.forEach(balance => {
      const current = latestBalanceByAccountId.get(balance.accountId);
      if (!current || balance.asOf > current.asOf) latestBalanceByAccountId.set(balance.accountId, balance);
    });

    return effectiveAccountRecords.flatMap(account => {
      const source = sourceById.get(account.id);
      const balance = latestBalanceByAccountId.get(account.id);

      if (!source || !balance) return [];

      return [{
        ...source,
        ...account,
        ledgerBalanceMinor: balance.ledgerBalanceMinor,
        availableBalanceMinor: balance.availableBalanceMinor,
        balanceAsOf: balance.asOf,
      }];
    });
  }, [accounts, effectiveAccountRecords, effectiveBalances]);
  const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: 20 });
  const [mobileState, setMobileState] = useState<DataTableState>({
    query: "",
    filters: {},
    pageIndex: 0,
    pageSize: Math.max(effectiveAccounts.length, 1),
    sort: { columnId: "account", direction: "ascending" },
  });
  const rowModel = createAccountsPresentationRowModel(effectiveAccounts, mobileState);

  return (
    <>
      <div className="accounts-heading">
        <h2>Accounts</h2>
        <span>{effectiveAccounts.length} {effectiveAccounts.length === 1 ? "account" : "accounts"}</span>
      </div>
      <div className="accounts-table">
        <DataTable
          caption="Accounts and balances"
          rows={effectiveAccounts}
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
        <div className="accounts-search">
          <Input
            label="Search accounts"
            visuallyHiddenLabel
            placeholder="Search accounts"
            type="search"
            value={mobileState.query}
            onChange={event => setMobileState({ ...mobileState, query: event.currentTarget.value, pageIndex: 0 })}
          />
        </div>
        <MobileTableSortControls iconOnlyDirection label="Sort accounts by" options={accountSortOptions} state={mobileState} onStateChange={setMobileState} />
        <div className="accounts-mobile-count">
          {rowModel.filteredRows.length} {rowModel.filteredRows.length === 1 ? "account" : "accounts"}
        </div>
        {rowModel.sortedRows.map(account => (
          <article key={account.id} className="acc-card-shell">
            <Link className="acc-card" href={`/accounts/${account.id}`}>
              <div className="acc-card-header">
                <div className="acc-card-identity">
                  <div className="acc-name">{account.name}</div>
                  <div className="acc-identifiers">
                    <span>{account.sortCode ?? "—"}</span>
                    <span aria-hidden="true">·</span>
                    <span>{account.accountNumber ?? "—"}</span>
                  </div>
                  {account.status !== "active" && (
                    <Badge variant={account.status === "restricted" ? "warning" : "neutral"}>
                      {account.status === "restricted" ? "Restricted" : "Closed"}
                    </Badge>
                  )}
                </div>
                <Icon name="chevron-right" size="medium" className="acc-card-chevron" aria-hidden="true" />
              </div>
              <div className="acc-card-balance">
                <strong className="financial-value">{formatMinorCurrencyAmount(account.availableBalanceMinor, account.currency)}</strong>
                <span>Available balance</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
