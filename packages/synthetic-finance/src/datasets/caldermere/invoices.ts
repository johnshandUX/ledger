import type { Invoice } from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

const businessId = CALDERMERE_BUSINESS_ID;

export const caldermereInvoices = [
  { id: "invoice-2026-1041", businessId, counterpartyId: "counterparty-oakwell-motors", invoiceNumber: "NS-2026-1041", issuedAt: "2026-09-24", dueAt: "2026-10-24", amountMinor: 48_620_00, outstandingAmountMinor: 48_620_00, currency: "GBP", status: "issued" },
  { id: "invoice-2026-1042", businessId, counterpartyId: "counterparty-pennine-retail", invoiceNumber: "NS-2026-1042", issuedAt: "2026-09-26", dueAt: "2026-10-26", amountMinor: 76_884_15, outstandingAmountMinor: 76_884_15, currency: "GBP", status: "issued" },
  { id: "invoice-2026-1043", businessId, counterpartyId: "counterparty-quayside-engineering", invoiceNumber: "NS-2026-1043", issuedAt: "2026-09-29", dueAt: "2026-10-29", amountMinor: 125_400_00, outstandingAmountMinor: 125_400_00, currency: "GBP", status: "issued" },
  { id: "invoice-2026-1044", businessId, counterpartyId: "counterparty-valence-france", invoiceNumber: "NS-EU-2026-211", issuedAt: "2026-10-01", dueAt: "2026-10-31", amountMinor: 92_750_00, outstandingAmountMinor: 92_750_00, currency: "EUR", status: "issued" },
  { id: "invoice-2026-1045", businessId, counterpartyId: "counterparty-westhaven-usa", invoiceNumber: "NS-US-2026-118", issuedAt: "2026-10-02", dueAt: "2026-11-01", amountMinor: 108_320_00, outstandingAmountMinor: 108_320_00, currency: "USD", status: "issued" },

  { id: "invoice-2026-1021", businessId, counterpartyId: "counterparty-redwood-distribution", invoiceNumber: "NS-2026-1021", issuedAt: "2026-08-14", dueAt: "2026-09-13", amountMinor: 62_440_80, outstandingAmountMinor: 0, currency: "GBP", status: "paid" },
  { id: "invoice-2026-1022", businessId, counterpartyId: "counterparty-summit-infrastructure", invoiceNumber: "NS-2026-1022", issuedAt: "2026-08-18", dueAt: "2026-09-17", amountMinor: 148_900_00, outstandingAmountMinor: 0, currency: "GBP", status: "paid" },
  { id: "invoice-2026-1023", businessId, counterpartyId: "counterparty-trident-wholesale", invoiceNumber: "NS-2026-1023", issuedAt: "2026-08-21", dueAt: "2026-09-20", amountMinor: 37_215_42, outstandingAmountMinor: 0, currency: "GBP", status: "paid" },
  { id: "invoice-2026-1024", businessId, counterpartyId: "counterparty-union-stores", invoiceNumber: "NS-2026-1024", issuedAt: "2026-08-25", dueAt: "2026-09-24", amountMinor: 84_602_11, outstandingAmountMinor: 0, currency: "GBP", status: "paid" },
  { id: "invoice-2026-1025", businessId, counterpartyId: "counterparty-zuidhaven-nl", invoiceNumber: "NS-EU-2026-203", issuedAt: "2026-08-27", dueAt: "2026-09-26", amountMinor: 54_880_00, outstandingAmountMinor: 0, currency: "EUR", status: "paid" },
  { id: "invoice-2026-1026", businessId, counterpartyId: "counterparty-ironwood-components", invoiceNumber: "NS-2026-1026", issuedAt: "2026-08-31", dueAt: "2026-09-30", amountMinor: 29_744_36, outstandingAmountMinor: 0, currency: "GBP", status: "paid" },

  { id: "invoice-2026-1031", businessId, counterpartyId: "counterparty-oakwell-motors", invoiceNumber: "NS-2026-1031", issuedAt: "2026-09-05", dueAt: "2026-10-05", amountMinor: 96_500_00, outstandingAmountMinor: 31_500_00, currency: "GBP", status: "part-paid" },
  { id: "invoice-2026-1032", businessId, counterpartyId: "counterparty-pennine-retail", invoiceNumber: "NS-2026-1032", issuedAt: "2026-09-07", dueAt: "2026-10-07", amountMinor: 44_780_26, outstandingAmountMinor: 12_280_26, currency: "GBP", status: "part-paid" },
  { id: "invoice-2026-1033", businessId, counterpartyId: "counterparty-westhaven-usa", invoiceNumber: "NS-US-2026-112", issuedAt: "2026-09-08", dueAt: "2026-10-08", amountMinor: 72_400_00, outstandingAmountMinor: 22_400_00, currency: "USD", status: "part-paid" },
  { id: "invoice-2026-1034", businessId, counterpartyId: "counterparty-meridian-tools", invoiceNumber: "NS-2026-1034", issuedAt: "2026-09-10", dueAt: "2026-10-10", amountMinor: 18_960_00, outstandingAmountMinor: 8_960_00, currency: "GBP", status: "part-paid" },

  { id: "invoice-2026-0991", businessId, counterpartyId: "counterparty-redwood-distribution", invoiceNumber: "NS-2026-0991", issuedAt: "2026-07-12", dueAt: "2026-08-11", amountMinor: 58_240_75, outstandingAmountMinor: 58_240_75, currency: "GBP", status: "overdue" },
  { id: "invoice-2026-0992", businessId, counterpartyId: "counterparty-summit-infrastructure", invoiceNumber: "NS-2026-0992", issuedAt: "2026-07-18", dueAt: "2026-08-17", amountMinor: 132_775_00, outstandingAmountMinor: 82_775_00, currency: "GBP", status: "overdue" },
  { id: "invoice-2026-0993", businessId, counterpartyId: "counterparty-trident-wholesale", invoiceNumber: "NS-2026-0993", issuedAt: "2026-07-24", dueAt: "2026-08-23", amountMinor: 24_118_90, outstandingAmountMinor: 24_118_90, currency: "GBP", status: "overdue" },
  { id: "invoice-2026-0994", businessId, counterpartyId: "counterparty-union-stores", invoiceNumber: "NS-2026-0994", issuedAt: "2026-08-01", dueAt: "2026-08-31", amountMinor: 67_330_44, outstandingAmountMinor: 17_330_44, currency: "GBP", status: "overdue" },
  { id: "invoice-2026-0995", businessId, counterpartyId: "counterparty-valence-france", invoiceNumber: "NS-EU-2026-195", issuedAt: "2026-08-05", dueAt: "2026-09-04", amountMinor: 41_600_00, outstandingAmountMinor: 41_600_00, currency: "EUR", status: "overdue" },
  { id: "invoice-2026-0996", businessId, counterpartyId: "counterparty-quayside-engineering", invoiceNumber: "NS-2026-0996", issuedAt: "2026-08-08", dueAt: "2026-09-07", amountMinor: 115_290_60, outstandingAmountMinor: 65_290_60, currency: "GBP", status: "overdue" },

  { id: "invoice-2026-0981", businessId, counterpartyId: "counterparty-oakwell-motors", invoiceNumber: "NS-2026-0981", issuedAt: "2026-07-01", dueAt: "2026-07-31", amountMinor: 12_740_00, outstandingAmountMinor: 0, currency: "GBP", status: "cancelled" },
  { id: "invoice-2026-0982", businessId, counterpartyId: "counterparty-pennine-retail", invoiceNumber: "NS-2026-0982", issuedAt: "2026-07-03", dueAt: "2026-08-02", amountMinor: 21_505_40, outstandingAmountMinor: 0, currency: "GBP", status: "cancelled" },
  { id: "invoice-2026-1046", businessId, counterpartyId: "counterparty-zuidhaven-nl", invoiceNumber: "NS-EU-2026-DRAFT-01", issuedAt: "2026-10-07", dueAt: "2026-11-06", amountMinor: 33_900_00, outstandingAmountMinor: 33_900_00, currency: "EUR", status: "draft" },
] satisfies Invoice[];
