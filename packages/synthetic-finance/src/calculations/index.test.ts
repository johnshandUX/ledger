import { describe, expect, it } from "vitest";

import {
  CALDERMERE_AS_OF,
  caldermereDataset,
} from "../datasets/caldermere/index.js";
import type { FinanceDataset } from "../validation/index.js";
import { getApprovalSummary } from "./approval-summary.js";
import { getFinancialSnapshot } from "./financial-snapshot.js";
import { getLiquidityPosition } from "./liquidity-position.js";
import { getPaymentSummary } from "./payment-summary.js";
import { getReceivablesPosition } from "./receivables-position.js";

const caldermereOptions = {
  businessId: "business-caldermere",
  asOf: CALDERMERE_AS_OF,
};

function emptyDataset(): FinanceDataset {
  return {
    businesses: [],
    legalEntities: [],
    users: [],
    roles: [],
    permissions: [],
    accounts: [],
    balances: [],
    transactions: [],
    counterparties: [],
    beneficiaries: [],
    payments: [],
    paymentApprovals: [],
    invoices: [],
  };
}

describe("payment and approval summaries", () => {
  it("returns the designed Caldermere payment summary", () => {
    expect(getPaymentSummary(caldermereDataset, caldermereOptions)).toEqual({
      totalPending: 12,
      awaitingApproval: 4,
      scheduled: 5,
      processing: 3,
      failed: 2,
      completedToday: 3,
    });
  });

  it("uses the explicit UTC calendar date", () => {
    expect(
      getPaymentSummary(caldermereDataset, {
        businessId: "business-caldermere",
        asOf: "2026-10-08T00:00:00Z",
      }).completedToday,
    ).toBe(0);
    expect(
      getPaymentSummary(caldermereDataset, {
        businessId: "business-caldermere",
        asOf: "2026-10-08T00:30:00+01:00",
      }).completedToday,
    ).toBe(3);
  });

  it("keeps payment and approval-action counts distinct", () => {
    expect(getApprovalSummary(caldermereDataset, caldermereOptions)).toEqual({
      paymentsAwaitingApproval: 4,
      outstandingApprovalActions: 7,
    });
  });
});

describe("currency positions", () => {
  it("groups Caldermere receivables by currency", () => {
    expect(getReceivablesPosition(caldermereDataset, caldermereOptions)).toEqual({
      byCurrency: [
        {
          currency: "GBP",
          outstandingMinor: 55_140_010,
          overdueMinor: 27_925_569,
          invoiceCount: 16,
          overdueInvoiceCount: 6,
        },
        {
          currency: "EUR",
          outstandingMinor: 16_825_000,
          overdueMinor: 4_160_000,
          invoiceCount: 4,
          overdueInvoiceCount: 1,
        },
        {
          currency: "USD",
          outstandingMinor: 13_072_000,
          overdueMinor: 0,
          invoiceCount: 2,
          overdueInvoiceCount: 0,
        },
      ],
    });
  });

  it("groups current liquidity by currency and excludes the closed account", () => {
    expect(getLiquidityPosition(caldermereDataset, caldermereOptions)).toEqual({
      byCurrency: [
        {
          currency: "GBP",
          ledgerBalanceMinor: 882_512_157,
          availableBalanceMinor: 825_531_975,
          accountCount: 23,
        },
        {
          currency: "USD",
          ledgerBalanceMinor: 52_823_510,
          availableBalanceMinor: 51_832_965,
          accountCount: 3,
        },
        {
          currency: "EUR",
          ledgerBalanceMinor: 45_675_511,
          availableBalanceMinor: 44_730_796,
          accountCount: 3,
        },
      ],
    });
  });

  it("uses only the latest snapshot for each account", () => {
    const dataset = emptyDataset();
    dataset.accounts = [
      { id: "account-1", businessId: "business-1", legalEntityId: "entity-1", name: "Account", accountType: "current", currency: "GBP", status: "active" },
    ];
    dataset.balances = [
      { id: "balance-old", accountId: "account-1", asOf: "2026-01-01T00:00:00Z", ledgerBalanceMinor: 100, availableBalanceMinor: 90, currency: "GBP" },
      { id: "balance-new", accountId: "account-1", asOf: "2026-02-01T00:00:00Z", ledgerBalanceMinor: 200, availableBalanceMinor: 180, currency: "GBP" },
    ];

    expect(getLiquidityPosition(dataset, { businessId: "business-1" })).toEqual({
      byCurrency: [
        {
          currency: "GBP",
          ledgerBalanceMinor: 200,
          availableBalanceMinor: 180,
          accountCount: 1,
        },
      ],
    });
  });

  it("rejects derived totals outside the safe integer range", () => {
    const dataset = emptyDataset();
    dataset.accounts = [
      { id: "account-1", businessId: "business-1", legalEntityId: "entity-1", name: "Account one", accountType: "current", currency: "GBP", status: "active" },
      { id: "account-2", businessId: "business-1", legalEntityId: "entity-1", name: "Account two", accountType: "current", currency: "GBP", status: "active" },
    ];
    dataset.balances = [
      { id: "balance-1", accountId: "account-1", asOf: "2026-01-01T00:00:00Z", ledgerBalanceMinor: Number.MAX_SAFE_INTEGER, availableBalanceMinor: 0, currency: "GBP" },
      { id: "balance-2", accountId: "account-2", asOf: "2026-01-01T00:00:00Z", ledgerBalanceMinor: 1, availableBalanceMinor: 0, currency: "GBP" },
    ];

    expect(() => getLiquidityPosition(dataset, { businessId: "business-1" }))
      .toThrow("Derived minor-unit total exceeds the safe integer range.");
  });
});

describe("financial snapshot", () => {
  it("composes the focused calculations without mutating the dataset", () => {
    const before = JSON.stringify(caldermereDataset);
    const snapshot = getFinancialSnapshot(caldermereDataset, caldermereOptions);

    expect(snapshot).toEqual({
      asOf: CALDERMERE_AS_OF,
      liquidity: getLiquidityPosition(caldermereDataset, caldermereOptions),
      receivables: getReceivablesPosition(caldermereDataset, caldermereOptions),
      payments: getPaymentSummary(caldermereDataset, caldermereOptions),
      approvals: getApprovalSummary(caldermereDataset, caldermereOptions),
    });
    expect(JSON.stringify(caldermereDataset)).toBe(before);
  });
});
