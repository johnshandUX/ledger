import { makeTransaction } from "../domain/Transaction";

export const transactions = [
  makeTransaction({ id: "t-1", accountId: "acc-ns-op", type: "credit", amount: 50000, date: "2026-08-01T10:00:00Z", description: "Invoice payment" }),
  makeTransaction({ id: "t-2", accountId: "acc-ns-op", type: "debit", amount: 2000, date: "2026-08-02T12:00:00Z", description: "Office supplies" }),
  makeTransaction({ id: "t-3", accountId: "acc-mg-1", type: "credit", amount: 3000, date: "2026-08-03T09:30:00Z", description: "Tenant rent" }),
];

export default transactions;
