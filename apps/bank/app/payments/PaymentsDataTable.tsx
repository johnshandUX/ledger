"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@johnshandux/ledger-design-system";
import { createDataTableRowModel, DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import type { BankPayment } from "../../src/finance/payments";
import { formatMinorCurrencyAmount } from "../../src/presentation/money";
import { formatPaymentDate, formatPaymentStatus, getPaymentStatusDate, getPaymentStatusVariant } from "../../src/presentation/payments";
import { MobileTableSortControls } from "../MobileTableSortControls";

function PaymentStatus({ payment }: { payment: BankPayment }) {
  return <Badge variant={getPaymentStatusVariant(payment.status)}>{formatPaymentStatus(payment.status)}</Badge>;
}

function StatusDate({ payment }: { payment: BankPayment }) {
  const date = getPaymentStatusDate(payment);
  return <div className="payment-date"><span>{formatPaymentDate(date.value)}</span><small>{date.label}</small></div>;
}

export const paymentColumns: readonly DataTableColumn<BankPayment>[] = [
  {
    id: "payment", label: "Payment reference", header: "Payment",
    cell: ({ row }) => <div className="payment-copy"><Link className="ledger-link payment-reference" href={`/payments/${row.id}`}>{row.reference}</Link><span>{row.beneficiary.name}</span></div>,
    sort: { value: row => row.reference },
  },
  { id: "account", label: "Source account", header: "Source account", cell: ({ row }) => <div className="payment-copy"><span>{row.sourceAccount.name}</span><small>{row.sourceAccount.currency}</small></div>, sort: { value: row => row.sourceAccount.name } },
  { id: "amount", label: "Amount", header: "Amount", align: "right", headerAlign: "right", numeric: true, nowrap: true, cell: ({ row }) => <span className="financial-value">{formatMinorCurrencyAmount(row.amountMinor, row.currency)}</span>, sort: { value: row => row.amountMinor } },
  { id: "status", label: "Status", header: "Status", nowrap: true, cell: ({ row }) => <PaymentStatus payment={row} />, sort: { value: row => formatPaymentStatus(row.status) } },
  { id: "statusDate", label: "Status date", header: "Status date", nowrap: true, cell: ({ row }) => <StatusDate payment={row} />, sort: { value: row => getPaymentStatusDate(row).value, initialDirection: "descending" } },
];

const pageSizes = [10, 20, 50] as const;
const sortOptions = [
  { columnId: "payment", label: "Payment reference" },
  { columnId: "account", label: "Source account" },
  { columnId: "amount", label: "Amount" },
  { columnId: "status", label: "Status" },
  { columnId: "statusDate", label: "Status date", initialDirection: "descending" as const },
] as const;

export function createPaymentsPresentationRowModel(payments: readonly BankPayment[], state: DataTableState, sizes: readonly number[] = pageSizes) {
  return createDataTableRowModel({ rows: payments, columns: paymentColumns, state, pageSizeOptions: sizes });
}

export function PaymentsDataTable({ payments }: { payments: readonly BankPayment[] }) {
  const mobilePageSizes = useMemo(() => [Math.max(payments.length, 1)], [payments.length]);
  const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: 20, sort: { columnId: "statusDate", direction: "descending" } });
  const mobileState = { ...state, pageIndex: 0, pageSize: mobilePageSizes[0]! };
  const rowModel = createPaymentsPresentationRowModel(payments, mobileState, mobilePageSizes);

  if (payments.length === 0) return <div className="empty-state"><h3>No payments to display</h3><p>Payments will appear here when activity is available.</p></div>;

  return <>
    <div className="payments-table"><DataTable caption="Caldermere payments" rows={payments} columns={paymentColumns} getRowId={payment => payment.id} pageSizeOptions={pageSizes} state={state} onStateChange={setState} /></div>
    <div className="payments-mobile">
      <MobileTableSortControls label="Sort payments by" options={sortOptions} state={state} onStateChange={setState} />
      <ol className="payment-card-list" aria-label="Caldermere payments">
        {rowModel.sortedRows.map(payment => <li className="payment-card" key={payment.id}>
          <div className="payment-card-header"><div className="payment-copy"><Link className="ledger-link payment-reference" href={`/payments/${payment.id}`}>{payment.reference}</Link><span>{payment.beneficiary.name}</span></div><strong className="financial-value">{formatMinorCurrencyAmount(payment.amountMinor, payment.currency)}</strong></div>
          <dl className="payment-card-meta"><div><dt>Source account</dt><dd>{payment.sourceAccount.name}</dd></div><div><dt>Status</dt><dd><PaymentStatus payment={payment} /></dd></div><div><dt>Status date</dt><dd><StatusDate payment={payment} /></dd></div></dl>
        </li>)}
      </ol>
    </div>
  </>;
}
