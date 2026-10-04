"use client";

import { formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import { DataTable, type DataTableColumn } from "@johnshandux/ledger-design-system/data-table";

type ExampleAccount = { id: string; name: string; currency: string; available: number };

const rows: readonly ExampleAccount[] = [
  { id: "operating", name: "Operating account", currency: "GBP", available: 248905.42 },
  { id: "europe", name: "European operations", currency: "EUR", available: 94620.5 },
];

const columns: readonly DataTableColumn<ExampleAccount>[] = [
  { id: "account", label: "Account", header: "Account", cell: ({ row }) => row.name, sort: { value: row => row.name } },
  { id: "currency", label: "Currency", header: "Currency", cell: ({ row }) => row.currency },
  { id: "available", label: "Available balance", header: "Available", align: "right", headerAlign: "right", numeric: true, cell: ({ row }) => formatCurrencyAmount(row.available, row.currency), sort: { value: row => row.available } },
];

export function DataTableExample() {
  return <DataTable caption="Example account balances" rows={rows} columns={columns} getRowId={row => row.id} pageSizeOptions={[10, 20, 50]} />;
}
