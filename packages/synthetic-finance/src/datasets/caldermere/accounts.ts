import type { Account } from "../../domain/index.js";
import {
  CALDERMERE_BUSINESS_ID,
  CALDERMERE_LEGAL_ENTITY_ID,
} from "./shared.js";

const ownership = {
  businessId: CALDERMERE_BUSINESS_ID,
  legalEntityId: CALDERMERE_LEGAL_ENTITY_ID,
} as const;

export const caldermereAccounts = [
  { id: "account-main-operating", ...ownership, name: "Main Operating Account", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-01", accountNumber: "90000001" },
  { id: "account-general-operations", ...ownership, name: "General Operations Account", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-02", accountNumber: "90000002" },
  { id: "account-cardiff-operations", ...ownership, name: "Cardiff Operations Account", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-03", accountNumber: "90000003" },
  { id: "account-bristol-operations", ...ownership, name: "Bristol Operations Account", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-04", accountNumber: "90000004" },
  { id: "account-birmingham-operations", ...ownership, name: "Birmingham Operations Account", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-05", accountNumber: "90000005" },
  { id: "account-supplier-payments", ...ownership, name: "Supplier Payments", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-06", accountNumber: "90000006" },
  { id: "account-procurement-payments", ...ownership, name: "Procurement Payments", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-07", accountNumber: "90000007" },
  { id: "account-capital-expenditure", ...ownership, name: "Capital Expenditure and Plant Modernisation", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-08", accountNumber: "90000008" },
  { id: "account-monthly-payroll", ...ownership, name: "Monthly Payroll", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-09", accountNumber: "90000009" },
  { id: "account-payroll-tax-benefits", ...ownership, name: "Payroll Tax & Employee Benefits", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-10", accountNumber: "90000010" },
  { id: "account-vat", ...ownership, name: "VAT Account", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-11", accountNumber: "90000011" },
  { id: "account-corporation-tax", ...ownership, name: "Corporation Tax Reserve", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-12", accountNumber: "90000012" },
  { id: "account-uk-customer-receipts", ...ownership, name: "UK Customer Receipts", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-13", accountNumber: "90000013" },
  { id: "account-wholesale-receipts", ...ownership, name: "Wholesale Receipts", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-14", accountNumber: "90000014" },
  { id: "account-export-receipts-gbp", ...ownership, name: "Export Receipts — Sterling Settlement", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-15", accountNumber: "90000015" },
  { id: "account-expense-cards", ...ownership, name: "Corporate Expense Card Settlement", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-16", accountNumber: "90000016" },
  { id: "account-merchant-refunds", ...ownership, name: "Customer Credits and Merchant Refunds", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-17", accountNumber: "90000017" },
  { id: "account-insurance-rates", ...ownership, name: "Property Insurance, Rates and Utilities", accountType: "current", currency: "GBP", status: "active", sortCode: "10-00-18", accountNumber: "90000018" },
  { id: "account-instant-access-reserve", ...ownership, name: "Instant Access Reserve", accountType: "deposit", currency: "GBP", status: "active", sortCode: "10-01-01", accountNumber: "91000001" },
  { id: "account-working-capital-reserve", ...ownership, name: "Working Capital Reserve", accountType: "deposit", currency: "GBP", status: "active", sortCode: "10-01-02", accountNumber: "91000002" },
  { id: "account-equipment-replacement", ...ownership, name: "Equipment Replacement Reserve", accountType: "deposit", currency: "GBP", status: "active", sortCode: "10-01-03", accountNumber: "91000003" },
  { id: "account-strategic-liquidity", ...ownership, name: "Strategic Liquidity Deposit", accountType: "deposit", currency: "GBP", status: "active", sortCode: "10-01-04", accountNumber: "91000004" },
  { id: "account-usd-operating", ...ownership, name: "USD Operating", accountType: "currency", currency: "USD", status: "active" },
  { id: "account-usd-receipts", ...ownership, name: "USD Customer Receipts", accountType: "currency", currency: "USD", status: "active" },
  { id: "account-usd-export-settlement", ...ownership, name: "USD Export Settlement", accountType: "currency", currency: "USD", status: "active" },
  { id: "account-eur-operating", ...ownership, name: "EUR Operating", accountType: "currency", currency: "EUR", status: "active" },
  { id: "account-eur-receipts", ...ownership, name: "EUR Customer Receipts", accountType: "currency", currency: "EUR", status: "active" },
  { id: "account-eur-supplier-payments", ...ownership, name: "EUR Supplier Payments", accountType: "currency", currency: "EUR", status: "active" },
  { id: "account-restricted-project", ...ownership, name: "Restricted Project Account — Regional Innovation Grant", accountType: "restricted", currency: "GBP", status: "restricted", sortCode: "10-02-01", accountNumber: "92000001" },
  { id: "account-historical-plant", ...ownership, name: "Historical Plant Operations Account (Closed)", accountType: "current", currency: "GBP", status: "closed", sortCode: "10-09-99", accountNumber: "99000001" },
] satisfies Account[];
