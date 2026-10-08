import { describe, expect, it } from "vitest";

import { formatMinorCurrencyAmount } from "./money";

describe("formatMinorCurrencyAmount", () => {
  it.each([
    [18_432_048, "GBP", "£184,320.48"],
    [18_432_048, "USD", "US$184,320.48"],
    [18_432_048, "EUR", "€184,320.48"],
  ] as const)("formats %i %s minor units", (amount, currency, expected) => {
    expect(formatMinorCurrencyAmount(amount, currency)).toBe(expected);
  });

  it("rejects unsafe or fractional minor-unit values", () => {
    expect(() => formatMinorCurrencyAmount(1.5, "GBP")).toThrow("safe integer");
  });
});
