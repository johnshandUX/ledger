import { describe, expect, it } from "vitest";

import { getApprovalSummary } from "../calculations/approval-summary.js";
import { getLiquidityPosition } from "../calculations/liquidity-position.js";
import { getPaymentSummary } from "../calculations/payment-summary.js";
import { getReceivablesPosition } from "../calculations/receivables-position.js";
import {
  createCaldermereDataset,
  CALDERMERE_AS_OF,
  caldermereDataset,
} from "../datasets/caldermere/index.js";
import { getPayments } from "../selectors/payments.js";
import { validateFinanceDataset } from "../validation/index.js";
import {
  createCaldermereScenario,
  financeScenarios,
} from "./index.js";

const businessId = "business-caldermere";
const calculationOptions = { businessId, asOf: CALDERMERE_AS_OF };

describe("Caldermere scenarios", () => {
  it("normal trading is the standard enriched environment", () => {
    expect(createCaldermereScenario({ scenario: "normal-trading" })).toEqual(
      createCaldermereDataset(),
    );
  });

  it("is deterministic for every scenario", () => {
    for (const { id } of financeScenarios) {
      const options = { scenario: id, seed: 2_026, asOf: CALDERMERE_AS_OF };
      expect(createCaldermereScenario(options)).toEqual(
        createCaldermereScenario(options),
      );
    }
  });

  it("produces a valid FinanceDataset for every scenario", () => {
    expect(financeScenarios).toHaveLength(6);
    expect(new Set(financeScenarios.map(({ id }) => id)).size).toBe(6);
    for (const { id } of financeScenarios) {
      expect(validateFinanceDataset(createCaldermereScenario({ scenario: id }))).toEqual({
        valid: true,
        errors: [],
      });
    }
  });

  it("does not mutate or share mutable state with anchor or enriched datasets", () => {
    const anchorBefore = JSON.stringify(caldermereDataset);
    const enriched = createCaldermereDataset();
    const enrichedBefore = JSON.stringify(enriched);
    const first = createCaldermereScenario({ scenario: "approval-backlog" });
    const second = createCaldermereScenario({ scenario: "approval-backlog" });

    first.businesses[0]!.legalEntityIds.push("mutation-test");
    first.counterparties[0]!.roles.push("supplier");

    expect(second.businesses[0]!.legalEntityIds).not.toContain("mutation-test");
    expect(second.counterparties[0]!.roles).toEqual(
      caldermereDataset.counterparties[0]!.roles,
    );
    expect(JSON.stringify(caldermereDataset)).toBe(anchorBefore);
    expect(JSON.stringify(enriched)).toBe(enrichedBefore);
  });

  it("cash-flow pressure reduces available liquidity and increases overdue receivables", () => {
    const baseline = createCaldermereScenario({ scenario: "normal-trading" });
    const pressured = createCaldermereScenario({ scenario: "cash-flow-pressure" });
    const baselineLiquidity = getLiquidityPosition(baseline, calculationOptions)
      .byCurrency.find(({ currency }) => currency === "GBP")!;
    const pressuredLiquidity = getLiquidityPosition(pressured, calculationOptions)
      .byCurrency.find(({ currency }) => currency === "GBP")!;
    const baselineReceivables = getReceivablesPosition(baseline, calculationOptions)
      .byCurrency.find(({ currency }) => currency === "GBP")!;
    const pressuredReceivables = getReceivablesPosition(pressured, calculationOptions)
      .byCurrency.find(({ currency }) => currency === "GBP")!;

    expect(pressuredLiquidity.ledgerBalanceMinor).toBe(
      baselineLiquidity.ledgerBalanceMinor,
    );
    expect(pressuredLiquidity.availableBalanceMinor).toBeLessThan(
      baselineLiquidity.availableBalanceMinor,
    );
    expect(pressuredReceivables.overdueMinor).toBeGreaterThan(
      baselineReceivables.overdueMinor,
    );
    expect(pressuredReceivables.overdueInvoiceCount).toBeGreaterThan(
      baselineReceivables.overdueInvoiceCount,
    );
    expect(
      pressured.invoices
        .filter(({ id }) => id === "invoice-2026-1041" || id === "invoice-2026-1042")
        .every(({ dueAt, issuedAt }) => dueAt >= issuedAt && dueAt < CALDERMERE_AS_OF),
    ).toBe(true);
  });

  it("overdue receivables increases derived overdue amounts and counts", () => {
    const baseline = getReceivablesPosition(
      createCaldermereScenario({ scenario: "normal-trading" }),
      calculationOptions,
    );
    const overdue = getReceivablesPosition(
      createCaldermereScenario({ scenario: "overdue-receivables" }),
      calculationOptions,
    );
    const baselineByCurrency = new Map(
      baseline.byCurrency.map((position) => [position.currency, position]),
    );

    for (const position of overdue.byCurrency.filter(({ currency }) =>
      currency === "GBP" || currency === "EUR")) {
      const original = baselineByCurrency.get(position.currency)!;
      expect(position.overdueMinor).toBeGreaterThan(original.overdueMinor);
      expect(position.overdueInvoiceCount).toBeGreaterThan(
        original.overdueInvoiceCount,
      );
    }
    expect(
      createCaldermereScenario({ scenario: "overdue-receivables" }).invoices
        .filter(({ id }) => /^invoice-2026-104[1-4]$/.test(id))
        .every(({ dueAt, issuedAt }) => dueAt >= issuedAt && dueAt < CALDERMERE_AS_OF),
    ).toBe(true);
  });

  it("large outgoing payments adds plausible scheduled and processing payments", () => {
    const baseline = createCaldermereScenario({ scenario: "normal-trading" });
    const scenario = createCaldermereScenario({ scenario: "large-outgoing-payments" });
    const added = getPayments(scenario, { businessId }).filter(({ id }) =>
      id.startsWith("payment-scenario-large-"),
    );
    const baselineSummary = getPaymentSummary(baseline, calculationOptions);
    const scenarioSummary = getPaymentSummary(scenario, calculationOptions);

    expect(added).toHaveLength(3);
    expect(added.every(({ amountMinor }) => amountMinor >= 7_500_000)).toBe(true);
    expect(new Set(added.map(({ status }) => status))).toEqual(
      new Set(["scheduled", "processing"]),
    );
    expect(scenarioSummary.totalPending).toBe(baselineSummary.totalPending + 3);
  });

  it("approval backlog increases payments and outstanding approval actions", () => {
    const baseline = createCaldermereScenario({ scenario: "normal-trading" });
    const backlog = createCaldermereScenario({ scenario: "approval-backlog" });
    const baselineApprovals = getApprovalSummary(baseline, calculationOptions);
    const backlogApprovals = getApprovalSummary(backlog, calculationOptions);
    const baselinePayments = getPaymentSummary(baseline, calculationOptions);
    const backlogPayments = getPaymentSummary(backlog, calculationOptions);

    expect(backlogApprovals.paymentsAwaitingApproval).toBe(
      baselineApprovals.paymentsAwaitingApproval + 5,
    );
    expect(backlogApprovals.outstandingApprovalActions).toBe(
      baselineApprovals.outstandingApprovalActions + 12,
    );
    expect(backlogPayments.awaitingApproval).toBe(
      baselinePayments.awaitingApproval + 5,
    );
    expect(backlogPayments.totalPending).toBe(baselinePayments.totalPending + 5);
  });

  it("restricts only the intended active account and preserves its ledger balance", () => {
    const baseline = createCaldermereScenario({ scenario: "normal-trading" });
    const restricted = createCaldermereScenario({ scenario: "restricted-account" });
    const baselineRestrictedIds = baseline.accounts
      .filter(({ status }) => status === "restricted")
      .map(({ id }) => id);
    const restrictedIds = restricted.accounts
      .filter(({ status }) => status === "restricted")
      .map(({ id }) => id);
    const baselineBalance = baseline.balances.find(
      ({ accountId }) => accountId === "account-main-operating",
    )!;
    const restrictedBalance = restricted.balances.find(
      ({ accountId }) => accountId === "account-main-operating",
    )!;

    expect(new Set(restrictedIds)).toEqual(
      new Set([...baselineRestrictedIds, "account-main-operating"]),
    );
    expect(restrictedBalance.ledgerBalanceMinor).toBe(
      baselineBalance.ledgerBalanceMinor,
    );
    expect(restrictedBalance.availableBalanceMinor).toBeLessThan(
      baselineBalance.availableBalanceMinor,
    );
    expect(
      baseline.accounts.find(({ id }) => id === "account-main-operating")?.status,
    ).toBe("active");
  });
});
