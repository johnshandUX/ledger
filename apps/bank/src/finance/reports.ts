import {
  getFinancialSnapshot,
  getLiquidityPosition,
  getReceivablesPosition,
} from "@johnshandux/ledger-synthetic-finance";

import {
  BANK_BUSINESS_ID,
  BANK_FINANCE_AS_OF,
  bankFinanceEnvironment,
} from "./environment";

const options = { businessId: BANK_BUSINESS_ID, asOf: BANK_FINANCE_AS_OF };

export function getBankLiquidityPosition() {
  return getLiquidityPosition(bankFinanceEnvironment, options);
}

export function getBankReceivablesPosition() {
  return getReceivablesPosition(bankFinanceEnvironment, options);
}

export function getBankFinancialSnapshot() {
  return getFinancialSnapshot(bankFinanceEnvironment, options);
}
