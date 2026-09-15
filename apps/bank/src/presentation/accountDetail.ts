import type { AccountType } from "../domain/Account";
import type { CurrencyCode } from "../domain/CurrencyCode";
import type { Transaction } from "../domain/Transaction";

export function formatCurrency(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value);
}

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
