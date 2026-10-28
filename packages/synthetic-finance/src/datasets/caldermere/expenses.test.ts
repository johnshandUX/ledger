import { describe, expect, it } from "vitest";

import {
  getCardLimitUtilisation,
  getCardTransactions,
  getExpenseAttentionCounts,
  getExpenseCards,
  getExpenseOrganisationSummary,
  getRecentExpenseTransactions,
  getExpenseTeamsWithSummaries,
  getTeamSpendingByCardholder,
  validateFinanceDataset,
} from "../../index.js";
import { caldermereDataset } from "./index.js";

const OCTOBER_2026 = {
  businessId: "business-caldermere",
  from: "2026-10-01",
  to: "2026-10-31",
  currency: "GBP" as const,
};

describe("Caldermere expenses baseline", () => {
  it("provides the intended deterministic dataset shape", () => {
    expect(caldermereDataset.expenseTeams).toHaveLength(5);
    expect(caldermereDataset.teamSpendingBudgets).toHaveLength(5);
    expect(caldermereDataset.expenseCardholders).toHaveLength(28);
    expect(
      caldermereDataset.expenseCardholders.filter(({ type }) => type === "external-contractor"),
    ).toHaveLength(5);
    expect(getExpenseCards(caldermereDataset, { businessId: "business-caldermere", type: "physical" })).toHaveLength(8);
    expect(getExpenseCards(caldermereDataset, { businessId: "business-caldermere", type: "virtual" })).toHaveLength(25);
    expect(caldermereDataset.cardTransactions).toHaveLength(300);
    expect(caldermereDataset.expenseRecords.length).toBeGreaterThan(250);
    expect(validateFinanceDataset(caldermereDataset)).toEqual({ valid: true, errors: [] });
  });

  it("keeps card type, lifecycle status and history independent", () => {
    const businessId = "business-caldermere";
    expect(getExpenseCards(caldermereDataset, { businessId, status: "active" }).length).toBeGreaterThan(0);
    expect(getExpenseCards(caldermereDataset, { businessId, status: "frozen" })).toHaveLength(1);
    expect(getExpenseCards(caldermereDataset, { businessId, status: "pending_activation" })).toHaveLength(1);
    expect(getExpenseCards(caldermereDataset, { businessId, status: "expired" })).toHaveLength(1);
    const cancelled = getExpenseCards(caldermereDataset, { businessId, status: "cancelled" });
    expect(cancelled).toHaveLength(1);
    expect(getCardTransactions(caldermereDataset, businessId, cancelled[0]!.id).length).toBeGreaterThan(0);
    const expired = getExpenseCards(caldermereDataset, { businessId, status: "expired" })[0]!;
    const expiredHistory = getCardTransactions(caldermereDataset, businessId, expired.id);
    expect(expiredHistory.length).toBeGreaterThan(0);
    expect(expiredHistory.every(({ transactedAt }) => transactedAt.slice(0, 10) <= expired.expiresAt!))
      .toBe(true);
    for (const transaction of caldermereDataset.cardTransactions.filter(
      ({ status }) => status === "settled" || status === "pending",
    )) {
      const card = caldermereDataset.expenseCards.find(({ id }) => id === transaction.cardId)!;
      const date = transaction.transactedAt.slice(0, 10);
      expect(date >= card.issuedAt).toBe(true);
      expect(card.activatedAt === undefined || date >= card.activatedAt).toBe(true);
      expect(card.validFrom === undefined || date >= card.validFrom).toBe(true);
      expect(card.validTo === undefined || date <= card.validTo).toBe(true);
      expect(card.expiresAt === undefined || date <= card.expiresAt).toBe(true);
    }
  });

  it("keeps cardholders distinct from optional banking-user references", () => {
    const photographer = caldermereDataset.expenseCardholders.find(
      ({ id }) => id === "expense-cardholder-elena-rossi",
    );
    expect(photographer).toMatchObject({
      type: "external-contractor",
      primaryTeamId: "expense-team-marketing",
    });
    expect(photographer).not.toHaveProperty("userId");
    expect(
      caldermereDataset.expenseCardholders.some(({ userId }) => userId !== undefined),
    ).toBe(true);
  });

  it("models company-level cardholder lifecycle independently from card status", () => {
    const counts = Object.fromEntries(
      ["active", "frozen", "pending_activation", "removed"].map((status) => [
        status,
        caldermereDataset.expenseCardholders.filter((cardholder) => cardholder.status === status).length,
      ]),
    );
    expect(counts).toEqual({ active: 24, frozen: 1, pending_activation: 1, removed: 2 });
    expect(caldermereDataset.expenseCardholders.find(({ id }) => id === "expense-cardholder-daniel-okafor")?.status).toBe("frozen");
    expect(caldermereDataset.expenseCardholders.find(({ id }) => id === "expense-cardholder-jack-murphy")?.status).toBe("pending_activation");
    expect(caldermereDataset.expenseCardholders.find(({ id }) => id === "expense-cardholder-leo-carter")?.status).toBe("removed");
    expect(caldermereDataset.expenseCardholders.find(({ id }) => id === "expense-cardholder-sophie-bennett")?.status).toBe("active");
    expect(caldermereDataset.expenseCards.find(({ id }) => id === "expense-card-virtual-sophie-bennett")?.status).toBe("expired");
  });

  it("contains monthly, lifetime and per-transaction limit examples without successful breaches", () => {
    expect(new Set(caldermereDataset.cardSpendingLimits.map(({ type }) => type))).toEqual(
      new Set(["monthly", "total", "per_transaction"]),
    );

    const photographer = getCardLimitUtilisation(
      caldermereDataset,
      "expense-card-virtual-elena-rossi",
      OCTOBER_2026,
    );
    expect(photographer).toMatchObject({ cumulative: true, spentMinor: 205_000, remainingMinor: 20_000 });

    const perTransactionCard = caldermereDataset.cardSpendingLimits.find(
      ({ type }) => type === "per_transaction",
    )!;
    expect(getCardLimitUtilisation(caldermereDataset, perTransactionCard.cardId, OCTOBER_2026))
      .toEqual({ limit: perTransactionCard, cumulative: false, maximumTransactionMinor: 100_000 });

    for (const limit of caldermereDataset.cardSpendingLimits.filter(({ type }) => type === "per_transaction")) {
      const successfulPurchases = caldermereDataset.cardTransactions.filter(
        (transaction) =>
          transaction.cardId === limit.cardId &&
          transaction.status === "settled" &&
          transaction.type === "purchase",
      );
      expect(successfulPurchases.every(({ amountMinor }) => amountMinor <= limit.amountMinor)).toBe(true);
    }
    for (const limit of caldermereDataset.cardSpendingLimits.filter(({ type }) => type !== "per_transaction")) {
      const utilisation = getCardLimitUtilisation(caldermereDataset, limit.cardId, OCTOBER_2026);
      expect(utilisation?.cumulative).toBe(true);
      if (utilisation?.cumulative) {
        expect(utilisation.spentMinor).toBeLessThanOrEqual(limit.amountMinor);
      }
    }
  });

  it("calculates lifetime utilisation only through the explicit reporting as-of date", () => {
    const cardId = "expense-card-virtual-elena-rossi";
    const before = getCardLimitUtilisation(caldermereDataset, cardId, {
      businessId: "business-caldermere",
      from: "2026-09-01",
      to: "2026-09-21",
      currency: "GBP",
    });
    const during = getCardLimitUtilisation(caldermereDataset, cardId, {
      businessId: "business-caldermere",
      from: "2026-09-01",
      to: "2026-09-22",
      currency: "GBP",
    });
    const after = getCardLimitUtilisation(caldermereDataset, cardId, OCTOBER_2026);
    expect(before).toMatchObject({ cumulative: true, spentMinor: 0, remainingMinor: 225_000 });
    expect(during).toMatchObject({ cumulative: true, spentMinor: 205_000, remainingMinor: 20_000 });
    expect(after).toMatchObject({ cumulative: true, spentMinor: 205_000, remainingMinor: 20_000 });
  });

  it.each(["monthly", "total"] as const)(
    "rejects a chronological %s hard-limit breach even when a later refund reduces net spending",
    (limitType) => {
      const dataset = structuredClone(caldermereDataset);
      const limit = dataset.cardSpendingLimits.find(({ type }) => type === limitType)!;
      const card = dataset.expenseCards.find(({ id }) => id === limit.cardId)!;
      const merchantId = dataset.merchants[0]!.id;
      const breachIndex = dataset.cardTransactions.length;
      dataset.cardTransactions.push(
        {
          id: `expense-transaction-test-${limitType}-breach`,
          cardId: card.id,
          cardholderId: card.cardholderId,
          spendingTeamId: card.spendingTeamId,
          merchantId,
          amountMinor: limit.amountMinor + 1,
          currency: limit.currency,
          transactedAt: "2026-09-16T09:00:00Z",
          settledAt: "2026-09-16T10:00:00Z",
          status: "settled",
          type: "purchase",
        },
        {
          id: `expense-transaction-test-${limitType}-refund`,
          cardId: card.id,
          cardholderId: card.cardholderId,
          spendingTeamId: card.spendingTeamId,
          merchantId,
          amountMinor: limit.amountMinor,
          currency: limit.currency,
          transactedAt: "2026-09-17T09:00:00Z",
          settledAt: "2026-09-17T10:00:00Z",
          status: "settled",
          type: "refund",
        },
      );
      const result = validateFinanceDataset(dataset);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        path: `cardTransactions[${breachIndex}].amountMinor`,
        message: `Settled purchase breaches ${limitType} limit for ExpenseCard "${card.id}" at the transaction time.`,
      });
    },
  );

  it("validates expense references independently from banking users", () => {
    const dataset = structuredClone(caldermereDataset);
    dataset.expenseCardholders[0]!.userId = "missing-user";
    dataset.cardTransactions[0]!.merchantId = "missing-merchant";
    dataset.expenseRecords[0]!.cardTransactionId = "missing-card-transaction";
    const result = validateFinanceDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "expenseCardholders[0].userId" }),
      expect.objectContaining({ path: "cardTransactions[0].merchantId" }),
      expect.objectContaining({ path: "expenseRecords[0].cardTransactionId" }),
    ]));
  });

  it("rejects pending or settled activity on an unactivated card", () => {
    const dataset = structuredClone(caldermereDataset);
    const card = dataset.expenseCards.find(
      ({ id }) => id === "expense-card-physical-jack-murphy",
    )!;
    const index = dataset.cardTransactions.length;
    dataset.cardTransactions.push({
      id: "expense-transaction-test-unactivated-card",
      cardId: card.id,
      cardholderId: card.cardholderId,
      spendingTeamId: card.spendingTeamId,
      merchantId: dataset.merchants[0]!.id,
      amountMinor: 1_000,
      currency: "GBP",
      transactedAt: "2026-10-07T08:30:00Z",
      status: "pending",
      type: "purchase",
    });

    const result = validateFinanceDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      path: `cardTransactions[${index}].cardId`,
      message: `Successful CardTransaction cannot use unactivated ExpenseCard "${card.id}".`,
    });
  });
});

describe("expense selectors", () => {
  it("separates settled and pending totals and excludes declined and reversed activity", () => {
    const summary = getExpenseOrganisationSummary(caldermereDataset, OCTOBER_2026);
    const expectedSettled = caldermereDataset.cardTransactions
      .filter(
        ({ currency, status, transactedAt }) =>
          currency === "GBP" && status === "settled" && transactedAt.startsWith("2026-10-"),
      )
      .reduce((total, transaction) => total + (transaction.type === "refund" ? -transaction.amountMinor : transaction.amountMinor), 0);
    const expectedPending = caldermereDataset.cardTransactions
      .filter(
        ({ currency, status, type, transactedAt }) =>
          currency === "GBP" && status === "pending" && type === "purchase" && transactedAt.startsWith("2026-10-"),
      )
      .reduce((total, { amountMinor }) => total + amountMinor, 0);

    expect(summary).toMatchObject({
      settledSpendingMinor: expectedSettled,
      pendingSpendingMinor: expectedPending,
      physicalCardCount: 8,
      virtualCardCount: 25,
      cardholderCount: 28,
      totalMonthlyTeamBudgetsMinor: 6_000_000,
    });
  });

  it("identifies Marketing budget pressure and permits a negative remainder", () => {
    const marketing = getExpenseTeamsWithSummaries(caldermereDataset, OCTOBER_2026).find(
      ({ team }) => team.id === "expense-team-marketing",
    )!;
    expect(marketing.settledSpendingMinor).toBeGreaterThan(marketing.budget!.amountMinor);
    expect(marketing.budgetUtilisationPercentage).toBeGreaterThan(100);
    expect(marketing.remainingBudgetMinor).toBeLessThan(0);
  });

  it("uses historical transaction attribution for cross-team cardholder spending", () => {
    const contractor = caldermereDataset.expenseCardholders.find(
      ({ id }) => id === "expense-cardholder-sana-ali",
    )!;
    expect(contractor.primaryTeamId).toBe("expense-team-operations");
    const marketingSpend = getTeamSpendingByCardholder(
      caldermereDataset,
      "expense-team-marketing",
      OCTOBER_2026,
    ).find(({ cardholder }) => cardholder.id === contractor.id);
    expect(marketingSpend?.settledSpendingMinor).toBeGreaterThanOrEqual(62_000);

    const reassigned = structuredClone(caldermereDataset);
    reassigned.expenseCardholders.find(({ id }) => id === contractor.id)!.primaryTeamId =
      "expense-team-people";
    expect(
      getTeamSpendingByCardholder(reassigned, "expense-team-marketing", OCTOBER_2026)
        .find(({ cardholder }) => cardholder.id === contractor.id)?.settledSpendingMinor,
    ).toBe(marketingSpend?.settledSpendingMinor);
  });

  it("keeps receipt, review and reconciliation attention independent", () => {
    const attention = getExpenseAttentionCounts(caldermereDataset);
    expect(attention.missingReceipts).toBeGreaterThan(0);
    expect(attention.pendingReview).toBeGreaterThan(0);
    expect(attention.unreconciled).toBeGreaterThan(0);
    expect(attention.automaticallyMatched).toBeGreaterThan(0);
    expect(
      caldermereDataset.expenseRecords.some(
        ({ receiptStatus, reconciliationStatus }) =>
          receiptStatus === "attached" && reconciliationStatus === "unreconciled",
      ),
    ).toBe(true);
    expect(
      caldermereDataset.cardTransactions
        .filter(({ status }) => status === "pending")
        .every((transaction) =>
          caldermereDataset.expenseRecords.some(
            ({ cardTransactionId, reconciliationStatus }) =>
              cardTransactionId === transaction.id && reconciliationStatus === "unreconciled",
          ),
        ),
    ).toBe(true);
  });

  it("does not leak team or card data across business scopes", () => {
    const foreignPeriod = { ...OCTOBER_2026, businessId: "business-other" };
    expect(getExpenseCards(caldermereDataset, { businessId: "business-other" })).toEqual([]);
    expect(getExpenseTeamsWithSummaries(caldermereDataset, foreignPeriod)).toEqual([]);
    expect(
      getCardLimitUtilisation(
        caldermereDataset,
        "expense-card-virtual-elena-rossi",
        foreignPeriod,
      ),
    ).toBeUndefined();
  });

  it("scopes recent expense activity by business, reporting dates and currency", () => {
    const dataset = structuredClone(caldermereDataset);
    const source = dataset.cardTransactions.find(
      ({ id }) => id === "expense-transaction-cross-team",
    )!;
    dataset.expenseTeams.push({
      id: "expense-team-foreign",
      businessId: "business-other",
      name: "Foreign team",
      status: "active",
    });
    dataset.cardTransactions.push(
      {
        ...source,
        id: "expense-transaction-test-foreign-business",
        spendingTeamId: "expense-team-foreign",
        transactedAt: "2026-10-30T12:00:00Z",
      },
      {
        ...source,
        id: "expense-transaction-test-out-of-period",
        transactedAt: "2026-11-01T12:00:00Z",
      },
      {
        ...source,
        id: "expense-transaction-test-other-currency",
        currency: "EUR",
        transactedAt: "2026-10-31T12:00:00Z",
      },
    );

    const scoped = getRecentExpenseTransactions(dataset, 400, {
      businessId: "business-caldermere",
      period: OCTOBER_2026,
    });
    const scopedIds = scoped.map(({ transaction }) => transaction.id);
    expect(scopedIds).not.toContain("expense-transaction-test-foreign-business");
    expect(scopedIds).not.toContain("expense-transaction-test-out-of-period");
    expect(scopedIds).not.toContain("expense-transaction-test-other-currency");
    expect(scopedIds).toContain("expense-transaction-cross-team");
  });

  it("preserves the unscoped recent-expense selector contract", () => {
    expect(getRecentExpenseTransactions(caldermereDataset, 3).map(({ transaction }) => transaction.id))
      .toEqual(
        [...caldermereDataset.cardTransactions]
          .sort((left, right) => right.transactedAt.localeCompare(left.transactedAt))
          .slice(0, 3)
          .map(({ id }) => id),
      );
  });

  it("is deterministic and does not mutate transaction order", () => {
    const before = caldermereDataset.cardTransactions.map(({ id }) => id);
    const first = getExpenseOrganisationSummary(caldermereDataset, OCTOBER_2026);
    const second = getExpenseOrganisationSummary(caldermereDataset, OCTOBER_2026);
    expect(second).toEqual(first);
    expect(caldermereDataset.cardTransactions.map(({ id }) => id)).toEqual(before);
  });
});
