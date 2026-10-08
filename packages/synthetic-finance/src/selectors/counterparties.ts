import type {
  BusinessId,
  Counterparty,
  CounterpartyRole,
  CounterpartyType,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface CounterpartyQueryOptions {
  businessId?: BusinessId;
  role?: CounterpartyRole;
  type?: CounterpartyType;
}

/** Returns matching counterparties in their stable dataset order. */
export function getCounterparties(
  dataset: FinanceDataset,
  options: CounterpartyQueryOptions = {},
): Counterparty[] {
  return dataset.counterparties.filter(
    (counterparty) =>
      (options.businessId === undefined ||
        counterparty.businessId === options.businessId) &&
      (options.role === undefined || counterparty.roles.includes(options.role)) &&
      (options.type === undefined || counterparty.type === options.type),
  );
}
