"use client";

import { formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import { DataTable, type DataTableColumn } from "@johnshandux/ledger-design-system/data-table";

type PreviewAccount = { name: string; currency: string; balance: number };

const columns: readonly DataTableColumn<PreviewAccount>[] = [
  { id: "account", label: "Account", header: "Account", cell: ({ row }) => row.name, sort: { value: row => row.name } },
  { id: "currency", label: "Currency", header: "Currency", cell: ({ row }) => row.currency, sort: { value: row => row.currency } },
  { id: "available", label: "Available balance", header: "Available", align: "right", headerAlign: "right", numeric: true, nowrap: true, cell: ({ row }) => formatCurrencyAmount(row.balance, row.currency), sort: { value: row => row.balance } },
];

const playgroundAccounts = [
  ["Operating account", "GBP", 248905.42], ["Payroll", "GBP", 84720.18], ["Client receipts", "GBP", 125600.00],
  ["European operations", "EUR", 94620.50], ["US operations", "USD", 132450.75], ["Reserve", "USD", 50000.00],
] as const;

const bankAccounts = [
  ["Operating account", "GBP", 240000.5], ["Payroll account", "GBP", 15000], ["Tax reserve", "GBP", 50000],
] as const;

export function AccountPreview({ compact = false, source = "playground" }: { compact?: boolean; source?: "playground" | "bank" }) {
  const isBankPreview = source === "bank";
  const accounts = isBankPreview ? bankAccounts : playgroundAccounts;
  const visibleAccounts = accounts.slice(0, compact ? 4 : 6).map(([name, currency, balance]) => ({ name, currency, balance }));
  return (
    <div className={`bank-preview ${compact ? "bank-preview--compact" : ""}`}>
      <div className="bank-preview__bar"><span>Ledger Bank</span><span className="status-dot">{isBankPreview ? "Illustrative preview" : "Curated example data"}</span></div>
      <div className="bank-preview__body">
        <div className="bank-preview__heading"><div><span className="eyebrow">Example Manufacturing Ltd</span><h3>Accounts</h3></div><span className="preview-action">Make a payment</span></div>
        <div className="balance-grid"><div><span>Total available · GBP</span><strong>{isBankPreview ? "£305,000.50" : "£459,225.60"}</strong></div><div><span>Accounts</span><strong>{isBankPreview ? "3" : "6"}</strong></div><div><span>Currencies</span><strong>{isBankPreview ? "1" : "3"}</strong></div></div>
        <div className="preview-table"><DataTable caption={isBankPreview ? "Illustrative Ledger Bank account preview" : "Curated commercial bank account example"} rows={visibleAccounts} columns={columns} getRowId={account => account.name} pageSizeOptions={[visibleAccounts.length]} /></div>
      </div>
    </div>
  );
}
