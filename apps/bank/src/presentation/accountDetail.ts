import type { AccountType } from "@johnshandux/ledger-synthetic-finance";
import type { BankTransaction } from "../finance/transactions";

export function formatPostedDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" }).format(new Date(value));
}

export function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(value));
}

export function formatAccountType(type: AccountType): string {
  const labels: Record<AccountType, string> = {
    current: "Current account",
    deposit: "Deposit account",
    currency: "Currency account",
    restricted: "Restricted account",
  };
  return labels[type];
}

export function getTransactionAmounts(transaction: BankTransaction): { moneyInMinor?: number; moneyOutMinor?: number } {
  return transaction.direction === "credit"
    ? { moneyInMinor: transaction.amountMinor }
    : { moneyOutMinor: transaction.amountMinor };
}
