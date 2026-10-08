import type {
  AccountQueryOptions,
  DerivedPaymentQueryOptions,
  TransactionQueryOptions,
} from "../selectors/index.js";
import type { IsoDateTime } from "../domain/index.js";
import {
  getAccounts,
  getOverdueInvoices,
  getPaymentsAwaitingApproval,
  getTransactions,
} from "../selectors/index.js";
import {
  getApprovalSummary,
  getFinancialSnapshot,
  getLiquidityPosition,
  getPaymentSummary,
  getReceivablesPosition,
} from "../calculations/index.js";
import { CALDERMERE_AS_OF } from "../datasets/caldermere/index.js";
import {
  createCaldermereScenario,
  type FinanceScenarioId,
} from "../scenarios/index.js";

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export interface CreateFinanceQueryContextOptions {
  scenario?: FinanceScenarioId;
  seed?: number;
  asOf?: IsoDateTime;
}

export interface FinanceQueryContext {
  getAccounts(options?: Omit<AccountQueryOptions, "businessId">): DeepReadonly<ReturnType<typeof getAccounts>>;
  getTransactions(options?: Omit<TransactionQueryOptions, "businessId">): DeepReadonly<ReturnType<typeof getTransactions>>;
  getPaymentsAwaitingApproval(options?: Omit<DerivedPaymentQueryOptions, "businessId">): DeepReadonly<ReturnType<typeof getPaymentsAwaitingApproval>>;
  getOverdueInvoices(): DeepReadonly<ReturnType<typeof getOverdueInvoices>>;
  getPaymentSummary(): DeepReadonly<ReturnType<typeof getPaymentSummary>>;
  getApprovalSummary(): DeepReadonly<ReturnType<typeof getApprovalSummary>>;
  getLiquidityPosition(): DeepReadonly<ReturnType<typeof getLiquidityPosition>>;
  getReceivablesPosition(): DeepReadonly<ReturnType<typeof getReceivablesPosition>>;
  getFinancialSnapshot(): DeepReadonly<ReturnType<typeof getFinancialSnapshot>>;
}

/** Creates a read-only Caldermere query boundary without exposing its dataset. */
export function createFinanceQueryContext(
  options: CreateFinanceQueryContextOptions = {},
): FinanceQueryContext {
  const scenario = options.scenario ?? "normal-trading";
  const asOf = options.asOf ?? CALDERMERE_AS_OF;
  const dataset = createCaldermereScenario({ scenario, seed: options.seed, asOf });
  const businessId = dataset.businesses[0]!.id;
  const calculationOptions = { businessId, asOf };

  return Object.freeze({
    getAccounts: (query = {}) => cloneResult(getAccounts(dataset, { ...query, businessId })),
    getTransactions: (query = {}) => cloneResult(getTransactions(dataset, { ...query, businessId })),
    getPaymentsAwaitingApproval: (query = {}) =>
      cloneResult(getPaymentsAwaitingApproval(dataset, { ...query, businessId })),
    getOverdueInvoices: () =>
      cloneResult(getOverdueInvoices(dataset, { businessId, asOf })),
    getPaymentSummary: () => cloneResult(getPaymentSummary(dataset, calculationOptions)),
    getApprovalSummary: () => cloneResult(getApprovalSummary(dataset, calculationOptions)),
    getLiquidityPosition: () => cloneResult(getLiquidityPosition(dataset, calculationOptions)),
    getReceivablesPosition: () =>
      cloneResult(getReceivablesPosition(dataset, calculationOptions)),
    getFinancialSnapshot: () =>
      cloneResult(getFinancialSnapshot(dataset, calculationOptions)),
  });
}

function cloneResult<T>(value: T): DeepReadonly<T> {
  if (Array.isArray(value)) {
    return value.map((item) => cloneResult(item)) as DeepReadonly<T>;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneResult(item)]),
    ) as DeepReadonly<T>;
  }
  return value as DeepReadonly<T>;
}
