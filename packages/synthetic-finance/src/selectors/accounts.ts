import type {
  Account,
  AccountId,
  AccountStatus,
  AccountType,
  BusinessId,
  CurrencyCode,
  LegalEntityId,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface AccountQueryOptions {
  businessId?: BusinessId;
  legalEntityId?: LegalEntityId;
  currency?: CurrencyCode;
  status?: AccountStatus;
  accountType?: AccountType;
}

/** Returns matching accounts in their stable dataset order. */
export function getAccounts(
  dataset: FinanceDataset,
  options: AccountQueryOptions = {},
): Account[] {
  return dataset.accounts.filter(
    (account) =>
      (options.businessId === undefined || account.businessId === options.businessId) &&
      (options.legalEntityId === undefined ||
        account.legalEntityId === options.legalEntityId) &&
      (options.currency === undefined || account.currency === options.currency) &&
      (options.status === undefined || account.status === options.status) &&
      (options.accountType === undefined || account.accountType === options.accountType),
  );
}

export function getAccountById(
  dataset: FinanceDataset,
  accountId: AccountId,
): Account | undefined {
  return dataset.accounts.find(({ id }) => id === accountId);
}
