import type {
  Counterparty,
  CurrencyCode,
  Invoice,
  InvoiceStatus,
} from "../domain/index.js";
import { addUtcDays } from "../internal/date.js";
import { generatedId, type GenerationContext } from "./types.js";

function invoiceStatus(index: number): InvoiceStatus {
  if (index <= 55) return "paid";
  if (index <= 70) return "issued";
  if (index <= 80) return "part-paid";
  if (index <= 92) return "overdue";
  return "cancelled";
}

export function generateInvoices(
  context: GenerationContext,
  businessId: string,
  counterparties: readonly Counterparty[],
): Invoice[] {
  const customers = counterparties.filter(({ roles }) => roles.includes("customer"));
  const invoices: Invoice[] = [];

  for (let index = 1; index <= 96; index += 1) {
    const status = invoiceStatus(index);
    const issueOffset = status === "issued"
      ? -context.random.integer(1, 20)
      : status === "overdue"
        ? -context.random.integer(45, 89)
        : -context.random.integer(5, 89);
    const issuedAt = addUtcDays(context.asOfDate, issueOffset);
    const dueAt = addUtcDays(issuedAt, 30);
    const currencyRoll = context.random.integer(1, 100);
    const currency: CurrencyCode = currencyRoll <= 76
      ? "GBP"
      : currencyRoll <= 88
        ? "USD"
        : "EUR";
    const amountMinor = context.random.integer(180_000, 18_000_000);
    const outstandingAmountMinor = status === "paid" || status === "cancelled"
      ? 0
      : status === "part-paid"
        ? Math.floor(amountMinor * context.random.integer(25, 75) / 100)
        : amountMinor;

    invoices.push({
      id: generatedId("invoice", index),
      businessId,
      counterpartyId: context.random.pick(customers).id,
      invoiceNumber: `NS-GEN-${String(index).padStart(5, "0")}`,
      issuedAt,
      dueAt,
      amountMinor,
      outstandingAmountMinor,
      currency,
      status,
    });
  }

  return invoices;
}
