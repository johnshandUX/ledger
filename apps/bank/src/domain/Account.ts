import { CurrencyCode, DEFAULT_CURRENCY } from "./CurrencyCode";

export interface Account {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  accountNumber: string;
  sortCode: string;
  type: string;
  currency: CurrencyCode;
  currentBalance: number;
  availableBalance: number;
}

export function makeAccount(overrides: Partial<Account> & { id: string; businessId: string; name: string; accountNumber: string; sortCode: string; type: string; currentBalance: number; availableBalance: number; }): Account {
  return {
    currency: DEFAULT_CURRENCY,
    ...overrides,
  } as Account;
}

export default Account;
