import { addUtcDays } from "../internal/date.js";
import type { FinanceScenarioOverlay } from "./types.js";

const invoiceOffsets: Record<string, number> = {
  "invoice-2026-1041": -7,
  "invoice-2026-1042": -6,
  "invoice-2026-1043": -4,
  "invoice-2026-1044": -2,
};

export const applyOverdueReceivables: FinanceScenarioOverlay = (
  dataset,
  context,
) => ({
  ...dataset,
  invoices: dataset.invoices.map((invoice) => {
    const dueOffset = invoiceOffsets[invoice.id];
    return dueOffset === undefined
      ? invoice
      : {
          ...invoice,
          dueAt: addUtcDays(context.asOfDate, dueOffset),
          status: "overdue" as const,
        };
  }),
});
