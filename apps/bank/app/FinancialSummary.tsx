"use client";

import { useState } from "react";
import type { CurrencyCode } from "@johnshandux/ledger-synthetic-finance";
import { formatMinorCurrencyAmount } from "../src/presentation/money";
import { useEffectiveLiquidityPosition } from "./useBankEffectiveState";

const supportedCurrencies = ["GBP", "USD", "EUR"] as const satisfies readonly CurrencyCode[];
type SupportedCurrency = (typeof supportedCurrencies)[number];

export function FinancialSummary() {
  const [currency, setCurrency] = useState<SupportedCurrency>("GBP");
  const liquidity = useEffectiveLiquidityPosition();
  const selected = liquidity.byCurrency.find(total => total.currency === currency);
  const availableBalanceMinor = selected?.availableBalanceMinor ?? 0;
  const ledgerBalanceMinor = selected?.ledgerBalanceMinor ?? 0;
  const differenceMinor = ledgerBalanceMinor - availableBalanceMinor;

  if (!Number.isSafeInteger(differenceMinor)) {
    throw new RangeError("Derived minor-unit difference exceeds the safe integer range.");
  }

  return (
    <section className="financial-summary" aria-labelledby="financial-summary-heading">
      <h2 className="visually-hidden" id="financial-summary-heading">Financial summary</h2>
      <fieldset className="currency-selector">
        <legend className="visually-hidden">Summary currency</legend>
        {supportedCurrencies.map(option => (
          <label className="currency-option" key={option}>
            <input checked={currency === option} name="summary-currency" onChange={() => setCurrency(option)} type="radio" value={option} />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <div className="financial-summary-balance financial-summary-balance--primary">
        <span>Total available</span>
        <strong className="financial-value">{formatMinorCurrencyAmount(availableBalanceMinor, currency)}</strong>
      </div>
      <div className="financial-summary-balance financial-summary-balance--secondary">
        <span>Total current</span>
        <strong className="financial-value">{formatMinorCurrencyAmount(ledgerBalanceMinor, currency)}</strong>
      </div>
      <details className="balance-difference">
        <summary>View difference</summary>
        <div>
          <span>Current less available</span>
          <strong className="financial-value">{formatMinorCurrencyAmount(differenceMinor, currency)}</strong>
        </div>
      </details>
    </section>
  );
}
