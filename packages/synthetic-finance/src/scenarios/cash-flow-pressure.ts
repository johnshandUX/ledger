import { addUtcDays } from "../internal/date.js";
import type { FinanceScenarioOverlay } from "./types.js";

const availableBalanceByAccountId: Record<string, number> = {
  "account-main-operating": 4_250_000,
  "account-general-operations": 1_850_000,
  "account-supplier-payments": 2_600_000,
};

const overdueInvoiceOffsets: Record<string, number> = {
  "invoice-2026-1041": -5,
  "invoice-2026-1042": -3,
};

export const applyCashFlowPressure: FinanceScenarioOverlay = (
  dataset,
  context,
) => ({
  ...dataset,
  balances: dataset.balances.map((balance) => {
    const availableBalanceMinor = availableBalanceByAccountId[balance.accountId];
    return availableBalanceMinor === undefined
      ? balance
      : { ...balance, availableBalanceMinor };
  }),
  invoices: dataset.invoices.map((invoice) => {
    const dueOffset = overdueInvoiceOffsets[invoice.id];
    return dueOffset === undefined
      ? invoice
      : {
          ...invoice,
          dueAt: addUtcDays(context.asOfDate, dueOffset),
          status: "overdue" as const,
        };
  }),
});
