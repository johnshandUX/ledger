import type { CurrencyCode } from "./common.js";
import type { BeneficiaryId, BusinessId, CounterpartyId } from "./ids.js";

export interface Beneficiary {
  id: BeneficiaryId;
  businessId: BusinessId;
  counterpartyId?: CounterpartyId;
  name: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  currency: CurrencyCode;
  defaultReference?: string;
}
