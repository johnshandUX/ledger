import { describe, expect, it } from "vitest";
import { prepareGenerativeFinanceData } from "./finance";

describe("generative hero finance preparation", () => {
  it("derives cash and approval data from Caldermere selectors", () => {
    const data = prepareGenerativeFinanceData();
    expect(data.availableByCurrency.map(({ currency }) => currency)).toEqual(["GBP", "USD", "EUR"]);
    expect(data.availableByCurrency[0]?.amountMinor).toBe(825_531_975);
    expect(data.payments).toHaveLength(4);
    expect(data.outstandingApprovalActions).toBe(7);
    expect(data.activity.length).toBeGreaterThan(0);
  });
});
