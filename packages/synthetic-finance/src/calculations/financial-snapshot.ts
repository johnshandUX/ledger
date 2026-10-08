import type { BusinessId, IsoDate, IsoDateTime } from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";
import {
  getApprovalSummary,
  type ApprovalSummary,
} from "./approval-summary.js";
import {
  getLiquidityPosition,
  type LiquidityPosition,
} from "./liquidity-position.js";
import {
  getPaymentSummary,
  type PaymentSummary,
} from "./payment-summary.js";
import {
  getReceivablesPosition,
  type ReceivablesPosition,
} from "./receivables-position.js";

export interface FinancialSnapshotOptions {
  businessId: BusinessId;
  asOf: IsoDate | IsoDateTime;
}

export interface FinancialSnapshot {
  asOf: IsoDate | IsoDateTime;
  liquidity: LiquidityPosition;
  receivables: ReceivablesPosition;
  payments: PaymentSummary;
  approvals: ApprovalSummary;
}

export function getFinancialSnapshot(
  dataset: FinanceDataset,
  options: FinancialSnapshotOptions,
): FinancialSnapshot {
  return {
    asOf: options.asOf,
    liquidity: getLiquidityPosition(dataset, options),
    receivables: getReceivablesPosition(dataset, options),
    payments: getPaymentSummary(dataset, options),
    approvals: getApprovalSummary(dataset, options),
  };
}
