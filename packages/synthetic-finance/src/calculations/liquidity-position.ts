import type {
  BalanceSnapshot,
  BusinessId,
  CurrencyCode,
  MinorUnitAmount,
} from "../domain/index.js";
import { addMinorUnits } from "../internal/money.js";
import { getAccounts } from "../selectors/accounts.js";
import type { FinanceDataset } from "../validation/index.js";

export interface LiquidityPositionOptions {
  businessId: BusinessId;
}

export interface CurrencyLiquidityPosition {
  currency: CurrencyCode;
  ledgerBalanceMinor: MinorUnitAmount;
  availableBalanceMinor: MinorUnitAmount;
  accountCount: number;
}

export interface LiquidityPosition {
  byCurrency: CurrencyLiquidityPosition[];
}

function getLatestBalance(
  dataset: FinanceDataset,
  accountId: string,
): BalanceSnapshot | undefined {
  return dataset.balances
    .filter((balance) => balance.accountId === accountId)
    .reduce<BalanceSnapshot | undefined>(
      (latest, balance) =>
        latest === undefined || balance.asOf > latest.asOf ? balance : latest,
      undefined,
    );
}

/** Includes non-closed accounts; restricted availability comes from the snapshot. */
export function getLiquidityPosition(
  dataset: FinanceDataset,
  options: LiquidityPositionOptions,
): LiquidityPosition {
  const accounts = getAccounts(dataset, { businessId: options.businessId }).filter(
    ({ status }) => status !== "closed",
  );
  const groups = new Map<CurrencyCode, CurrencyLiquidityPosition>();

  for (const account of accounts) {
    const balance = getLatestBalance(dataset, account.id);
    if (balance === undefined) continue;

    const group = groups.get(account.currency) ?? {
      currency: account.currency,
      ledgerBalanceMinor: 0,
      availableBalanceMinor: 0,
      accountCount: 0,
    };
    group.ledgerBalanceMinor = addMinorUnits(
      group.ledgerBalanceMinor,
      balance.ledgerBalanceMinor,
    );
    group.availableBalanceMinor = addMinorUnits(
      group.availableBalanceMinor,
      balance.availableBalanceMinor,
    );
    group.accountCount += 1;
    groups.set(account.currency, group);
  }

  return { byCurrency: [...groups.values()] };
}
