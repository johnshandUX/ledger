import { describe, expect, it } from "vitest";

import { createFinanceQueryContext } from "./index.js";

describe("read-only finance query context", () => {
  it("uses normal trading by default", () => {
    const context = createFinanceQueryContext();
    expect(context.getPaymentSummary()).toEqual({
      totalPending: 12,
      awaitingApproval: 4,
      scheduled: 5,
      processing: 3,
      failed: 2,
      completedToday: 3,
    });
    expect(context.getAccounts()).toHaveLength(30);
  });

  it("queries a selected scenario through the same surface", () => {
    const context = createFinanceQueryContext({ scenario: "approval-backlog" });
    expect(context.getApprovalSummary()).toEqual({
      paymentsAwaitingApproval: 9,
      outstandingApprovalActions: 19,
    });
  });

  it("does not expose mutation operations or mutable backing records", () => {
    const context = createFinanceQueryContext();
    const accounts = context.getAccounts();
    const originalName = accounts[0]!.name;

    (accounts[0] as { name: string }).name = "Changed by consumer";

    expect(context.getAccounts()[0]!.name).toBe(originalName);
    expect(Object.keys(context).sort()).toEqual([
      "getAccounts",
      "getApprovalSummary",
      "getFinancialSnapshot",
      "getLiquidityPosition",
      "getOverdueInvoices",
      "getPaymentSummary",
      "getPaymentsAwaitingApproval",
      "getReceivablesPosition",
      "getTransactions",
    ]);
  });
});
