import type { Payment } from "../domain/index.js";
import { addUtcDays } from "../internal/date.js";
import type { FinanceScenarioOverlay, ScenarioContext } from "./types.js";

function largePayments(context: ScenarioContext): Payment[] {
  const createdAt = `${addUtcDays(context.asOfDate, -1)}T15:00:00Z`;
  return [
    {
      id: "payment-scenario-large-001",
      businessId: context.businessId,
      sourceAccountId: "account-capital-expenditure",
      beneficiaryId: "beneficiary-forge-equipment",
      amountMinor: 24_000_000,
      currency: "GBP",
      reference: "PLANT-UPGRADE-STAGE-2",
      status: "scheduled",
      createdByUserId: "user-priya-shah",
      createdAt,
      scheduledFor: addUtcDays(context.asOfDate, 2),
    },
    {
      id: "payment-scenario-large-002",
      businessId: context.businessId,
      sourceAccountId: "account-supplier-payments",
      beneficiaryId: "beneficiary-apex-steel",
      amountMinor: 12_500_000,
      currency: "GBP",
      reference: "STEEL-BULK-ORDER",
      status: "processing",
      createdByUserId: "user-sophie-bennett",
      createdAt,
    },
    {
      id: "payment-scenario-large-003",
      businessId: context.businessId,
      sourceAccountId: "account-usd-operating",
      beneficiaryId: "beneficiary-westhaven-usa",
      amountMinor: 7_500_000,
      currency: "USD",
      reference: "US-EQUIPMENT-SERVICE",
      status: "scheduled",
      createdByUserId: "user-priya-shah",
      createdAt,
      scheduledFor: addUtcDays(context.asOfDate, 3),
    },
  ];
}

export const applyLargeOutgoingPayments: FinanceScenarioOverlay = (
  dataset,
  context,
) => ({
  ...dataset,
  payments: [...dataset.payments, ...largePayments(context)],
});
