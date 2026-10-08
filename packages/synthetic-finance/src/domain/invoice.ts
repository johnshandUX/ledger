import type { CurrencyCode, IsoDate, MinorUnitAmount } from "./common.js";
import type { BusinessId, CounterpartyId, InvoiceId } from "./ids.js";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "part-paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Invoice {
  id: InvoiceId;
  businessId: BusinessId;
  counterpartyId: CounterpartyId;
  invoiceNumber: string;
  issuedAt: IsoDate;
  dueAt: IsoDate;
  amountMinor: MinorUnitAmount;
  outstandingAmountMinor: MinorUnitAmount;
  currency: CurrencyCode;
  status: InvoiceStatus;
}
