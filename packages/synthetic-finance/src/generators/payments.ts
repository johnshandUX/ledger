import type {
  Beneficiary,
  Payment,
  PaymentApproval,
  UserId,
} from "../domain/index.js";
import { addUtcDays } from "../internal/date.js";
import {
  generatedId,
  generatedTimestamp,
  type GenerationContext,
} from "./types.js";

const gbpSourceAccounts = [
  "account-supplier-payments",
  "account-procurement-payments",
  "account-general-operations",
  "account-capital-expenditure",
  "account-insurance-rates",
] as const;

const creators: UserId[] = [
  "user-sophie-bennett",
  "user-jack-murphy",
  "user-hannah-clarke",
  "user-benjamin-frost",
  "user-priya-shah",
];

const approvers: UserId[] = [
  "user-amelia-hart",
  "user-daniel-okafor",
  "user-priya-shah",
];

export interface GeneratedPayments {
  payments: Payment[];
  approvals: PaymentApproval[];
}

export function generatePayments(
  context: GenerationContext,
  businessId: string,
  beneficiaries: readonly Beneficiary[],
): GeneratedPayments {
  const payments: Payment[] = [];
  const approvals: PaymentApproval[] = [];

  for (let index = 1; index <= 170; index += 1) {
    const beneficiary = context.random.pick(beneficiaries);
    const eventDate = addUtcDays(context.asOfDate, -context.random.integer(1, 86));
    const createdDate = addUtcDays(eventDate, -context.random.integer(1, 3));
    const completed = index <= 160;
    const paymentId = generatedId("payment", index);
    const sourceAccountId = beneficiary.currency === "GBP"
      ? context.random.pick(gbpSourceAccounts)
      : beneficiary.currency === "USD"
        ? "account-usd-operating"
        : "account-eur-supplier-payments";
    const amountMinor = context.random.integer(45_000, 12_500_000);
    const createdAt = generatedTimestamp(createdDate, 9, context.random.integer(0, 59));

    payments.push({
      id: paymentId,
      businessId,
      sourceAccountId,
      beneficiaryId: beneficiary.id,
      amountMinor,
      currency: beneficiary.currency,
      reference: `GEN-${String(context.random.integer(10_000, 99_999))}`,
      status: completed ? "completed" : "cancelled",
      createdByUserId: context.random.pick(creators),
      createdAt,
      ...(completed
        ? {
            completedAt: generatedTimestamp(
              eventDate,
              context.random.integer(10, 16),
              context.random.integer(0, 59),
            ),
          }
        : {
            cancelledAt: generatedTimestamp(
              eventDate,
              context.random.integer(10, 16),
              context.random.integer(0, 59),
            ),
          }),
    });

    approvals.push({
      id: generatedId("approval", index),
      paymentId,
      approverUserId: context.random.pick(approvers),
      status: completed ? "approved" : "rejected",
      createdAt: generatedTimestamp(createdDate, 10, context.random.integer(0, 59)),
      actedAt: generatedTimestamp(eventDate, 8, context.random.integer(0, 59)),
    });
  }

  return { payments, approvals };
}
