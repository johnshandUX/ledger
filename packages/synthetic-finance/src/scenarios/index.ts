import {
  createCaldermereDataset,
  CALDERMERE_AS_OF,
  type CreateCaldermereDatasetOptions,
} from "../datasets/caldermere/index.js";
import { getUtcCalendarDate } from "../internal/date.js";
import type { FinanceDataset } from "../validation/index.js";
import { applyApprovalBacklog } from "./approval-backlog.js";
import { applyCashFlowPressure } from "./cash-flow-pressure.js";
import { applyLargeOutgoingPayments } from "./large-outgoing-payments.js";
import { applyNormalTrading } from "./normal-trading.js";
import { applyOverdueReceivables } from "./overdue-receivables.js";
import { applyRestrictedAccount } from "./restricted-account.js";
import type {
  FinanceScenario,
  FinanceScenarioId,
  FinanceScenarioOverlay,
} from "./types.js";

export interface CreateCaldermereScenarioOptions
  extends CreateCaldermereDatasetOptions {
  scenario: FinanceScenarioId;
}

export const financeScenarios = [
  { id: "normal-trading", name: "Normal trading", description: "Deterministic background commercial activity without an exceptional condition." },
  { id: "cash-flow-pressure", name: "Cash-flow pressure", description: "Reduced available operating cash with a modest increase in overdue receivables." },
  { id: "overdue-receivables", name: "Overdue receivables", description: "Several current invoices have moved beyond their due dates while remaining outstanding." },
  { id: "large-outgoing-payments", name: "Large outgoing payments", description: "Several unusually large but plausible outgoing payments are scheduled or processing." },
  { id: "approval-backlog", name: "Approval backlog", description: "Additional payments and approval actions are waiting for authorised approvers." },
  { id: "restricted-account", name: "Restricted account", description: "The main operating account is restricted with materially reduced available funds." },
] as const satisfies readonly FinanceScenario[];

export function createCaldermereScenario(
  options: CreateCaldermereScenarioOptions,
): FinanceDataset {
  const asOf = options.asOf ?? CALDERMERE_AS_OF;
  const dataset = createCaldermereDataset({
    seed: options.seed,
    asOf,
  });
  const context = {
    businessId: dataset.businesses[0]!.id,
    asOf,
    asOfDate: getUtcCalendarDate(asOf),
  };
  return getOverlay(options.scenario)(dataset, context);
}

function getOverlay(scenario: FinanceScenarioId): FinanceScenarioOverlay {
  switch (scenario) {
    case "normal-trading":
      return applyNormalTrading;
    case "cash-flow-pressure":
      return applyCashFlowPressure;
    case "overdue-receivables":
      return applyOverdueReceivables;
    case "large-outgoing-payments":
      return applyLargeOutgoingPayments;
    case "approval-backlog":
      return applyApprovalBacklog;
    case "restricted-account":
      return applyRestrictedAccount;
  }
}

export type { FinanceScenario, FinanceScenarioId } from "./types.js";
