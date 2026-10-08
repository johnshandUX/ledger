import type { CurrencyCode } from "./common.js";
import type { AccountId, BusinessId, LegalEntityId } from "./ids.js";

export type AccountType = "current" | "deposit" | "currency" | "restricted";
export type AccountStatus = "active" | "restricted" | "closed";

export interface Account {
  id: AccountId;
  businessId: BusinessId;
  legalEntityId: LegalEntityId;
  name: string;
  accountType: AccountType;
  currency: CurrencyCode;
  status: AccountStatus;
  sortCode?: string;
  accountNumber?: string;
}
