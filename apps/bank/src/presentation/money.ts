import { formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import type { CurrencyCode } from "@johnshandux/ledger-synthetic-finance";

export function formatMinorCurrencyAmount(
  amountMinor: number,
  currency: CurrencyCode,
  locale = "en-GB",
): string {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new Error("Currency minor-unit amount must be a safe integer.");
  }
  return formatCurrencyAmount(amountMinor / 100, currency, locale);
}
