import type { Account } from "../domain/Account";
import type { CurrencyCode } from "../domain/CurrencyCode";

export type BalanceTotals = {
  currency: CurrencyCode;
  current: number;
  available: number;
};

export function getBalanceTotalsByCurrency(accounts: Account[]): BalanceTotals[] {
  const totals = new Map<CurrencyCode, BalanceTotals>();

  for (const account of accounts) {
    const total = totals.get(account.currency) ?? {
      currency: account.currency,
      current: 0,
      available: 0,
    };

    total.current += account.currentBalance;
    total.available += account.availableBalance;
    totals.set(account.currency, total);
  }

  return [...totals.values()];
}
