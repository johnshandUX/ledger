export const DEFAULT_CURRENCY_LOCALE = "en-GB";

const supportedCurrencyCodes = new Set(Intl.supportedValuesOf("currency"));

export function formatCurrencyAmount(
  value: number,
  currency: string,
  locale: string = DEFAULT_CURRENCY_LOCALE,
): string {
  if (!Number.isFinite(value)) {
    throw new TypeError("Currency amount must be a finite number");
  }

  if (!/^[A-Z]{3}$/.test(currency) || !supportedCurrencyCodes.has(currency)) {
    throw new RangeError("Currency must be a supported uppercase ISO 4217 code");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
