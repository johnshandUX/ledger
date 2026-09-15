import { describe, expect, it } from "vitest";
import { DEFAULT_CURRENCY_LOCALE, formatCurrencyAmount } from "./formatCurrencyAmount";

describe("formatCurrencyAmount", () => {
  it("defaults to Ledger's en-GB presentation locale", () => {
    expect(DEFAULT_CURRENCY_LOCALE).toBe("en-GB");
    expect(formatCurrencyAmount(1234.5, "GBP")).toBe("£1,234.50");
    expect(formatCurrencyAmount(1234.5, "EUR")).toBe("€1,234.50");
  });

  it("supports an explicit locale and currency-owned fraction digits", () => {
    expect(formatCurrencyAmount(1234.5, "USD", "en-US")).toBe("$1,234.50");
    expect(formatCurrencyAmount(1234, "JPY", "ja-JP")).toBe("￥1,234");
  });

  it("formats zero and negative values without assigning domain meaning", () => {
    expect(formatCurrencyAmount(0, "GBP")).toBe("£0.00");
    expect(formatCurrencyAmount(-42.5, "GBP")).toBe("-£42.50");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects non-finite value %s",
    (value) => {
      expect(() => formatCurrencyAmount(value, "GBP")).toThrow(
        "Currency amount must be a finite number",
      );
    },
  );

  it.each(["gbp", "GB", "STERLING", "ZZZ"])("rejects invalid currency code %s", (currency) => {
    expect(() => formatCurrencyAmount(1, currency)).toThrow(
      "Currency must be a supported uppercase ISO 4217 code",
    );
  });
});
