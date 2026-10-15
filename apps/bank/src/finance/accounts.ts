import {
  getAccountById,
  getAccounts,
  getLiquidityPosition,
  type Account,
  type BalanceSnapshot,
  type DeepReadonly,
  type LiquidityPosition,
} from "@johnshandux/ledger-synthetic-finance";

import {
  BANK_BUSINESS_ID,
  BANK_FINANCE_AS_OF,
  bankFinanceEnvironment,
} from "./environment";

export type BankAccount = Account & {
  ledgerBalanceMinor: number;
  availableBalanceMinor: number;
  balanceAsOf: string;
};

export interface BankAccountOverview {
  accounts: BankAccount[];
  liquidity: LiquidityPosition;
}

export function getBankAccounts(): BankAccount[] {
  return getAccounts(bankFinanceEnvironment, { businessId: BANK_BUSINESS_ID })
    .map(withCurrentBalance);
}

export function getBankAccountById(accountId: string): BankAccount | undefined {
  const account = getAccountById(bankFinanceEnvironment, accountId);
  return account?.businessId === BANK_BUSINESS_ID ? withCurrentBalance(account) : undefined;
}

export function getBankAccountOverview(): BankAccountOverview {
  return {
    accounts: getBankAccounts(),
    liquidity: getLiquidityPosition(bankFinanceEnvironment, {
      businessId: BANK_BUSINESS_ID,
    }),
  };
}

function withCurrentBalance(account: Account): BankAccount {
  const balance = currentBalanceFor(account.id);
  return {
    ...account,
    ledgerBalanceMinor: balance.ledgerBalanceMinor,
    availableBalanceMinor: balance.availableBalanceMinor,
    balanceAsOf: balance.asOf,
  };
}

function currentBalanceFor(accountId: string): BalanceSnapshot {
  const balance = getLatestBalanceForAccount(bankFinanceEnvironment.balances, accountId);
  if (!balance) {
    throw new Error(`Account ${accountId} has no balance snapshot at ${BANK_FINANCE_AS_OF}.`);
  }
  return balance;
}

export function getLatestBalanceForAccount(
  balances: readonly DeepReadonly<BalanceSnapshot>[],
  accountId: string,
): DeepReadonly<BalanceSnapshot> | undefined {
  return balances
    .filter((balance) => balance.accountId === accountId)
    .reduce<DeepReadonly<BalanceSnapshot> | undefined>((latest, balance) =>
      !latest || balance.asOf > latest.asOf ? balance : latest, undefined);
}
