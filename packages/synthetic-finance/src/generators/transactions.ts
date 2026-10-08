import type {
  AccountId,
  Counterparty,
  CurrencyCode,
  Payment,
  Transaction,
} from "../domain/index.js";
import { addUtcDays } from "../internal/date.js";
import {
  generatedId,
  generatedTimestamp,
  type GenerationContext,
} from "./types.js";

const receiptAccounts: Record<CurrencyCode, AccountId[]> = {
  GBP: ["account-uk-customer-receipts", "account-wholesale-receipts", "account-export-receipts-gbp"],
  USD: ["account-usd-receipts", "account-usd-export-settlement"],
  EUR: ["account-eur-receipts"],
};

const outgoingAccounts: Record<CurrencyCode, AccountId[]> = {
  GBP: ["account-supplier-payments", "account-procurement-payments", "account-general-operations", "account-insurance-rates", "account-expense-cards"],
  USD: ["account-usd-operating"],
  EUR: ["account-eur-supplier-payments", "account-eur-operating"],
};

const customerDescriptions = [
  "Customer payment",
  "Trade receipt",
  "Wholesale customer remittance",
  "Export customer receipt",
] as const;

const supplierDescriptions = [
  "Supplier payment",
  "Equipment maintenance",
  "Courier services",
  "Professional services",
  "Utilities payment",
] as const;

const operatingDescriptions = [
  "Insurance premium",
  "Business rates",
  "Software services",
  "Fleet costs",
  "Monthly payroll",
] as const;

function weightedCurrency(context: GenerationContext): CurrencyCode {
  const roll = context.random.integer(1, 100);
  return roll <= 84 ? "GBP" : roll <= 92 ? "USD" : "EUR";
}

export function generateTransactions(
  context: GenerationContext,
  counterparties: readonly Counterparty[],
  generatedPayments: readonly Payment[],
): Transaction[] {
  const customers = counterparties.filter(({ roles }) => roles.includes("customer"));
  const suppliers = counterparties.filter(({ roles }) => roles.includes("supplier"));
  const transactions: Transaction[] = [];

  for (const payment of generatedPayments.filter(({ status }) => status === "completed")) {
    const beneficiaryCounterpartyId = payment.beneficiaryId.startsWith("beneficiary-gen-")
      ? generatedId(
          "counterparty-supplier",
          ((Number(payment.beneficiaryId.slice(-6)) - 1) % 8) + 1,
        )
      : undefined;
    transactions.push({
      id: generatedId("transaction", transactions.length + 1),
      accountId: payment.sourceAccountId,
      bookedAt: payment.completedAt!,
      valueDate: payment.completedAt!.slice(0, 10),
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      direction: "debit",
      description: "Completed commercial payment",
      ...(beneficiaryCounterpartyId === undefined
        ? {}
        : { counterpartyId: beneficiaryCounterpartyId }),
      paymentId: payment.id,
    });
  }

  while (transactions.length < 1_152) {
    const index = transactions.length + 1;
    const currency = weightedCurrency(context);
    const date = addUtcDays(context.asOfDate, -context.random.integer(1, 89));
    const bookedAt = generatedTimestamp(
      date,
      context.random.integer(6, 18),
      context.random.integer(0, 59),
    );
    const activityRoll = context.random.integer(1, 100);

    if (activityRoll <= 36) {
      const counterparty = context.random.pick(customers);
      transactions.push({
        id: generatedId("transaction", index),
        accountId: context.random.pick(receiptAccounts[currency]),
        bookedAt,
        valueDate: date,
        amountMinor: context.random.integer(90_000, 16_000_000),
        currency,
        direction: "credit",
        description: context.random.pick(customerDescriptions),
        counterpartyId: counterparty.id,
      });
    } else if (activityRoll <= 72) {
      const counterparty = context.random.pick(suppliers);
      transactions.push({
        id: generatedId("transaction", index),
        accountId: context.random.pick(outgoingAccounts[currency]),
        bookedAt,
        valueDate: date,
        amountMinor: context.random.integer(45_000, 8_500_000),
        currency,
        direction: "debit",
        description: context.random.pick(supplierDescriptions),
        counterpartyId: counterparty.id,
      });
    } else if (activityRoll <= 84) {
      transactions.push({
        id: generatedId("transaction", index),
        accountId: currency === "GBP"
          ? context.random.pick(["account-main-operating", "account-working-capital-reserve", "account-monthly-payroll"])
          : context.random.pick(outgoingAccounts[currency]),
        bookedAt,
        valueDate: date,
        amountMinor: context.random.integer(1_000_000, 30_000_000),
        currency,
        direction: context.random.integer(0, 1) === 0 ? "credit" : "debit",
        description: "Internal treasury movement",
      });
    } else if (activityRoll <= 92) {
      transactions.push({
        id: generatedId("transaction", index),
        accountId: context.random.pick(outgoingAccounts[currency]),
        bookedAt,
        valueDate: date,
        amountMinor: context.random.integer(500, 45_000),
        currency,
        direction: "debit",
        description: "Bank fees and charges",
      });
    } else {
      transactions.push({
        id: generatedId("transaction", index),
        accountId: context.random.pick(outgoingAccounts[currency]),
        bookedAt,
        valueDate: date,
        amountMinor: context.random.integer(10_000, 2_500_000),
        currency,
        direction: "debit",
        description: context.random.pick(operatingDescriptions),
      });
    }
  }

  return transactions;
}
