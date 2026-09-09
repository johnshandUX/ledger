import { CurrencyCode, DEFAULT_CURRENCY } from "./CurrencyCode";

export interface Transaction {
  id: string;
  accountId: string;
  type: "credit" | "debit" | "transfer" | string;
  amount: number;
  currency: CurrencyCode;
  date: string; // ISO
  description?: string;
}

export function makeTransaction(props: Partial<Transaction> & { id: string; accountId: string; type: Transaction["type"]; amount: number; date: string; }) {
  return {
    currency: DEFAULT_CURRENCY,
    ...props,
  } as Transaction;
}

export default Transaction;
