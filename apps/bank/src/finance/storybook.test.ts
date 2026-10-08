import { describe, expect, it } from "vitest";
import { validateFinanceDataset } from "@johnshandux/ledger-synthetic-finance";

import { getCaldermereStoryEnvironment } from "./storybook";

describe("Caldermere Storybook environment", () => {
  it.each([
    "normal-trading",
    "approval-backlog",
    "restricted-account",
    "cash-flow-pressure",
    "large-outgoing-payments",
  ] as const)("provides a valid %s story state", (scenario) => {
    expect(validateFinanceDataset(getCaldermereStoryEnvironment(scenario))).toEqual({
      valid: true,
      errors: [],
    });
  });
});
