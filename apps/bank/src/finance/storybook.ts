import {
  createCaldermereScenario,
  type FinanceDataset,
  type FinanceScenarioId,
} from "@johnshandux/ledger-synthetic-finance";

/** Opt-in finance state for future product-composition stories. */
export function getCaldermereStoryEnvironment(
  scenario: FinanceScenarioId = "normal-trading",
): FinanceDataset {
  return createCaldermereScenario({ scenario });
}
