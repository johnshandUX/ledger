import type { Payment, PaymentApproval } from "../domain/index.js";
import { addUtcDays } from "../internal/date.js";
import type { FinanceScenarioOverlay, ScenarioContext } from "./types.js";

function backlogRecords(context: ScenarioContext): {
  payments: Payment[];
  approvals: PaymentApproval[];
} {
  const createdAt = `${addUtcDays(context.asOfDate, -1)}T14:30:00Z`;
  const paymentInputs = [
    ["account-supplier-payments", "beneficiary-apex-steel", 8_750_000, "GBP"],
    ["account-procurement-payments", "beneficiary-cedar-packaging", 4_280_000, "GBP"],
    ["account-capital-expenditure", "beneficiary-forge-equipment", 16_500_000, "GBP"],
    ["account-eur-supplier-payments", "beneficiary-valence-france", 5_400_000, "EUR"],
    ["account-usd-operating", "beneficiary-westhaven-usa", 4_900_000, "USD"],
  ] as const;
  const payments = paymentInputs.map(
    ([sourceAccountId, beneficiaryId, amountMinor, currency], index): Payment => ({
      id: `payment-scenario-backlog-${String(index + 1).padStart(3, "0")}`,
      businessId: context.businessId,
      sourceAccountId,
      beneficiaryId,
      amountMinor,
      currency,
      reference: `BACKLOG-${String(index + 1).padStart(3, "0")}`,
      status: "awaiting-approval",
      createdByUserId: index % 2 === 0 ? "user-sophie-bennett" : "user-jack-murphy",
      createdAt,
    }),
  );
  const approvers = [
    "user-amelia-hart",
    "user-daniel-okafor",
    "user-priya-shah",
  ] as const;
  const approvalCounts = [3, 2, 3, 2, 2] as const;
  const approvals: PaymentApproval[] = [];

  payments.forEach((payment, paymentIndex) => {
    for (let actionIndex = 0; actionIndex < approvalCounts[paymentIndex]!; actionIndex += 1) {
      approvals.push({
        id: `approval-scenario-backlog-${String(approvals.length + 1).padStart(3, "0")}`,
        paymentId: payment.id,
        approverUserId: approvers[actionIndex]!,
        status: "pending",
        createdAt,
      });
    }
  });

  return { payments, approvals };
}

export const applyApprovalBacklog: FinanceScenarioOverlay = (
  dataset,
  context,
) => {
  const records = backlogRecords(context);
  return {
    ...dataset,
    payments: [...dataset.payments, ...records.payments],
    paymentApprovals: [...dataset.paymentApprovals, ...records.approvals],
  };
};
