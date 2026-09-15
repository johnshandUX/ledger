import type { AccountType } from "../domain/Account";
import type { Transaction } from "../domain/Transaction";

export function formatPostedDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" }).format(new Date(value));
}

export function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(value));
}

export function formatAccountType(type: AccountType): string {
  return type === "current" ? "Current account" : "Reserve account";
}

export function getTransactionAmounts(transaction: Transaction): { moneyIn?: number; moneyOut?: number } {
  return transaction.direction === "credit" ? { moneyIn: transaction.amount } : { moneyOut: transaction.amount };
}
