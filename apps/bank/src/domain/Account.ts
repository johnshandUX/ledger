import { CurrencyCode, DEFAULT_CURRENCY } from "./CurrencyCode";

export type AccountType = "current" | "reserve";
export type AccountStatus = "active" | "restricted" | "closed";

/** Current and available balances must be finite and may be negative. */
export interface Account {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  accountNumber: string;
  sortCode: string;
  type: AccountType;
  status: AccountStatus;
  currency: CurrencyCode;
  currentBalance: number;
  availableBalance: number;
  balancesUpdatedAt: string;
}

export function makeAccount(overrides: Partial<Account> & { id: string; businessId: string; name: string; accountNumber: string; sortCode: string; type: AccountType; currentBalance: number; availableBalance: number; balancesUpdatedAt: string; }): Account {
  if (!Number.isFinite(overrides.currentBalance)) {
    throw new Error("Account current balance must be finite");
  }
  if (!Number.isFinite(overrides.availableBalance)) {
    throw new Error("Account available balance must be finite");
  }

  return {
    ...overrides,
    currency: overrides.currency ?? DEFAULT_CURRENCY,
    status: overrides.status ?? "active",
  } as Account;
}

export default Account;
