import type {
  BusinessId,
  CurrencyCode,
  IsoDate,
  IsoDateTime,
  MinorUnitAmount,
} from "../domain/index.js";
import { addMinorUnits } from "../internal/money.js";
import { getInvoices, getOverdueInvoices } from "../selectors/invoices.js";
import type { FinanceDataset } from "../validation/index.js";

export interface ReceivablesPositionOptions {
  businessId: BusinessId;
  asOf: IsoDate | IsoDateTime;
}

export interface CurrencyReceivablesPosition {
  currency: CurrencyCode;
  outstandingMinor: MinorUnitAmount;
  overdueMinor: MinorUnitAmount;
  invoiceCount: number;
  overdueInvoiceCount: number;
}

export interface ReceivablesPosition {
  byCurrency: CurrencyReceivablesPosition[];
}

export function getReceivablesPosition(
  dataset: FinanceDataset,
  options: ReceivablesPositionOptions,
): ReceivablesPosition {
  const invoices = getInvoices(dataset, { businessId: options.businessId }).filter(
    ({ status }) => status !== "cancelled",
  );
  const overdueIds = new Set(
    getOverdueInvoices(dataset, options).map(({ id }) => id),
  );
  const groups = new Map<CurrencyCode, CurrencyReceivablesPosition>();

  for (const invoice of invoices) {
    const group = groups.get(invoice.currency) ?? {
      currency: invoice.currency,
      outstandingMinor: 0,
      overdueMinor: 0,
      invoiceCount: 0,
      overdueInvoiceCount: 0,
    };
    group.outstandingMinor = addMinorUnits(
      group.outstandingMinor,
      invoice.outstandingAmountMinor,
    );
    group.invoiceCount += 1;
    if (overdueIds.has(invoice.id)) {
      group.overdueMinor = addMinorUnits(
        group.overdueMinor,
        invoice.outstandingAmountMinor,
      );
      group.overdueInvoiceCount += 1;
    }
    groups.set(invoice.currency, group);
  }

  return { byCurrency: [...groups.values()] };
}
