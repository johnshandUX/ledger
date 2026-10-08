import { describe, expect, expectTypeOf, it } from "vitest";

import {
  CALDERMERE_AS_OF,
  CALDERMERE_DEFAULT_SEED,
  createCaldermereDataset,
  createFinanceQueryContext,
  createCaldermereScenario,
  getAccounts,
  getFinancialSnapshot,
  financeScenarios,
  caldermereDataset,
  validateFinanceDataset,
  type Account,
  type FinanceDataset,
  type Invoice,
  type Payment,
} from "./index.js";

describe("package root", () => {
  it("exports the public validator", () => {
    expect(validateFinanceDataset).toBeTypeOf("function");
  });

  it("exports the canonical Caldermere dataset", () => {
    expect(CALDERMERE_AS_OF).toBe("2026-10-07T09:00:00Z");
    expect(caldermereDataset.businesses[0]?.name).toBe(
      "Caldermere Ltd",
    );
  });

  it("exports selectors and calculations", () => {
    expect(getAccounts).toBeTypeOf("function");
    expect(getFinancialSnapshot).toBeTypeOf("function");
  });

  it("exports the enriched Caldermere factory", () => {
    expect(CALDERMERE_DEFAULT_SEED).toBe(1042);
    expect(createCaldermereDataset).toBeTypeOf("function");
  });

  it("exports the Caldermere scenario surface", () => {
    expect(createCaldermereScenario).toBeTypeOf("function");
    expect(financeScenarios).toHaveLength(6);
  });

  it("exports the read-only finance query context", () => {
    expect(createFinanceQueryContext).toBeTypeOf("function");
  });

  it("exports the primary public contracts", () => {
    expectTypeOf<Account>().toBeObject();
    expectTypeOf<Payment>().toBeObject();
    expectTypeOf<Invoice>().toBeObject();
    expectTypeOf<FinanceDataset>().toBeObject();
  });
});
