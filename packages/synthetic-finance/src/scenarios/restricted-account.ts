import type { FinanceScenarioOverlay } from "./types.js";

const restrictedAccountId = "account-main-operating";

export const applyRestrictedAccount: FinanceScenarioOverlay = (dataset) => ({
  ...dataset,
  accounts: dataset.accounts.map((account) =>
    account.id === restrictedAccountId
      ? { ...account, status: "restricted" as const }
      : account,
  ),
  balances: dataset.balances.map((balance) =>
    balance.accountId === restrictedAccountId
      ? { ...balance, availableBalanceMinor: 2_500_000 }
      : balance,
  ),
});
