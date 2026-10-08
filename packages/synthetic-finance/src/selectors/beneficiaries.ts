import type {
  Beneficiary,
  BusinessId,
  CounterpartyId,
  CurrencyCode,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface BeneficiaryQueryOptions {
  businessId?: BusinessId;
  counterpartyId?: CounterpartyId;
  currency?: CurrencyCode;
}

/** Returns matching beneficiaries in their stable dataset order. */
export function getBeneficiaries(
  dataset: FinanceDataset,
  options: BeneficiaryQueryOptions = {},
): Beneficiary[] {
  return dataset.beneficiaries.filter(
    (beneficiary) =>
      (options.businessId === undefined ||
        beneficiary.businessId === options.businessId) &&
      (options.counterpartyId === undefined ||
        beneficiary.counterpartyId === options.counterpartyId) &&
      (options.currency === undefined || beneficiary.currency === options.currency),
  );
}
