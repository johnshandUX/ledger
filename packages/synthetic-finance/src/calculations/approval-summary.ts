import type { BusinessId } from "../domain/index.js";
import { getOutstandingApprovalActions } from "../selectors/payment-approvals.js";
import { getPaymentsAwaitingApproval } from "../selectors/payments.js";
import type { FinanceDataset } from "../validation/index.js";

export interface ApprovalSummaryOptions {
  businessId: BusinessId;
}

export interface ApprovalSummary {
  paymentsAwaitingApproval: number;
  outstandingApprovalActions: number;
}

export function getApprovalSummary(
  dataset: FinanceDataset,
  options: ApprovalSummaryOptions,
): ApprovalSummary {
  return {
    paymentsAwaitingApproval: getPaymentsAwaitingApproval(dataset, options).length,
    outstandingApprovalActions: getOutstandingApprovalActions(dataset, options).length,
  };
}
