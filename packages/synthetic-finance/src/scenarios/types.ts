import type { BusinessId, IsoDate, IsoDateTime } from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export type FinanceScenarioId =
  | "normal-trading"
  | "cash-flow-pressure"
  | "overdue-receivables"
  | "large-outgoing-payments"
  | "approval-backlog"
  | "restricted-account";

export interface FinanceScenario {
  id: FinanceScenarioId;
  name: string;
  description: string;
}

export interface ScenarioContext {
  businessId: BusinessId;
  asOf: IsoDateTime;
  asOfDate: IsoDate;
}

export type FinanceScenarioOverlay = (
  dataset: FinanceDataset,
  context: ScenarioContext,
) => FinanceDataset;
