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
    expect(data.cashFlow.slice(0, 2)).toEqual([
      { label: "03 Oct", incomingMinor: 16_400_000, outgoingMinor: 6_800_000 },
      { label: "04 Oct", incomingMinor: 10_200_000, outgoingMinor: 13_400_000 },
    ]);
    expect(data.cashFlow.every(({ incomingMinor, outgoingMinor }) => incomingMinor > 0 && outgoingMinor > 0)).toBe(true);
  });
});
