import type {
  BusinessId,
  CounterpartyId,
  CurrencyCode,
  Invoice,
  InvoiceId,
  InvoiceStatus,
  IsoDate,
  IsoDateTime,
} from "../domain/index.js";
import { getUtcCalendarDate } from "../internal/date.js";
import type { FinanceDataset } from "../validation/index.js";

export interface InvoiceQueryOptions {
  businessId?: BusinessId;
  counterpartyId?: CounterpartyId;
  status?: InvoiceStatus;
  currency?: CurrencyCode;
}

export interface OverdueInvoiceQueryOptions
  extends Omit<InvoiceQueryOptions, "status"> {
  asOf: IsoDate | IsoDateTime;
}

/** Returns matching invoices in their stable dataset order. */
export function getInvoices(
  dataset: FinanceDataset,
  options: InvoiceQueryOptions = {},
): Invoice[] {
  return dataset.invoices.filter(
    (invoice) =>
      (options.businessId === undefined || invoice.businessId === options.businessId) &&
      (options.counterpartyId === undefined ||
        invoice.counterpartyId === options.counterpartyId) &&
      (options.status === undefined || invoice.status === options.status) &&
      (options.currency === undefined || invoice.currency === options.currency),
  );
}

export function getInvoiceById(
  dataset: FinanceDataset,
  invoiceId: InvoiceId,
): Invoice | undefined {
  return dataset.invoices.find(({ id }) => id === invoiceId);
}

/** Derives overdue state from due date and outstanding value, not stored status. */
export function getOverdueInvoices(
  dataset: FinanceDataset,
  options: OverdueInvoiceQueryOptions,
): Invoice[] {
  const asOfDate = getUtcCalendarDate(options.asOf);
  return getInvoices(dataset, options).filter(
    (invoice) =>
      invoice.dueAt < asOfDate &&
      invoice.outstandingAmountMinor > 0 &&
      invoice.status !== "cancelled" &&
      invoice.status !== "paid",
  );
}
