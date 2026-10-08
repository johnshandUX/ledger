import type { CurrencyCode, IsoDateTime, MinorUnitAmount } from "./common.js";
import type { AccountId, BalanceSnapshotId } from "./ids.js";

export interface BalanceSnapshot {
  id: BalanceSnapshotId;
  accountId: AccountId;
  asOf: IsoDateTime;
  ledgerBalanceMinor: MinorUnitAmount;
  availableBalanceMinor: MinorUnitAmount;
  currency: CurrencyCode;
}
