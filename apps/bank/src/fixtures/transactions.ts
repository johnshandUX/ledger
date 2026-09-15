import { makeTransaction } from "../domain/Transaction";

export const transactions = [
  makeTransaction({ id: "t-1", accountId: "acc-ns-op", direction: "credit", amount: 125000, postedAt: "2026-09-15T08:30:00Z", description: "Customer settlement", counterpartyName: "Orion Retail Group Ltd", reference: "SETTLEMENT-SEP-2026", balanceAfter: 245000.5 }),
  makeTransaction({ id: "t-2", accountId: "acc-ns-op", direction: "debit", amount: 4999.5, postedAt: "2026-09-14T16:45:00Z", description: "Raw materials purchase", counterpartyName: "Alpha Supplies Ltd", reference: "INV-1001 / NORTHSTAR MANUFACTURING SEPTEMBER MATERIALS ORDER", balanceAfter: 120000.5 }),
  makeTransaction({ id: "t-3", accountId: "acc-ns-op", direction: "debit", amount: 82.17, postedAt: "2026-09-14T09:15:00Z", description: "Courier services", counterpartyName: "Citywide Logistics", reference: "CW-88412", balanceAfter: 125000 }),
  makeTransaction({ id: "t-4", accountId: "acc-ns-op", direction: "credit", amount: 0.63, postedAt: "2026-09-13T18:02:00Z", description: "Interest adjustment", reference: "INT-ADJ-09", balanceAfter: 125082.17 }),
  makeTransaction({ id: "t-5", accountId: "acc-ns-op", direction: "debit", amount: 5000, postedAt: "2026-09-12T14:20:00Z", status: "pending", description: "Supplier payment", counterpartyName: "Alpha Supplies Ltd", reference: "Supplier payment" }),
  makeTransaction({ id: "t-6", accountId: "acc-ns-op", direction: "debit", amount: 12000, postedAt: "2026-09-11T11:00:00Z", description: "Equipment lease", counterpartyName: "Meridian Asset Finance", reference: "LEASE-4471", balanceAfter: 125081.54 }),
  makeTransaction({ id: "t-7", accountId: "acc-ns-op", direction: "credit", amount: 32000, postedAt: "2026-09-10T15:40:00Z", description: "Invoice payment", counterpartyName: "Harbour Engineering PLC", reference: "INV-NS-2048", balanceAfter: 137081.54 }),
  makeTransaction({ id: "t-8", accountId: "acc-ns-pay", direction: "credit", amount: 27000, postedAt: "2026-09-10T09:00:00Z", description: "Payroll funding transfer", counterpartyName: "Northstar Manufacturing Ltd", reference: "PAYROLL-SEP", balanceAfter: 27000 }),
  makeTransaction({ id: "t-9", accountId: "acc-ns-pay", direction: "debit", amount: 12000, postedAt: "2026-09-10T09:00:00Z", description: "September payroll batch", reference: "BACS-SEP-01", balanceAfter: 15000 }),
  makeTransaction({ id: "t-10", accountId: "acc-mg-1", direction: "credit", amount: 3000, postedAt: "2026-09-15T07:30:00Z", description: "Tenant rent", counterpartyName: "Riverside Studios Ltd", reference: "UNIT-4-SEPTEMBER", balanceAfter: 80000 }),
];

export default transactions;
