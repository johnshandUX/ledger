import { describe, expect, it } from "vitest";

import { getApprovalSummary } from "../../calculations/approval-summary.js";
import { getPaymentSummary } from "../../calculations/payment-summary.js";
import { getReceivablesPosition } from "../../calculations/receivables-position.js";
import { addUtcDays, getUtcCalendarDate } from "../../internal/date.js";
import { validateFinanceDataset } from "../../validation/index.js";
import {
  createCaldermereDataset,
  CALDERMERE_AS_OF,
  CALDERMERE_DEFAULT_SEED,
  caldermereDataset,
} from "./index.js";

const businessId = "business-caldermere";

describe("createCaldermereDataset", () => {
  it("is deterministic for the same seed and asOf", () => {
    const options = { seed: 2_026, asOf: CALDERMERE_AS_OF };

    expect(createCaldermereDataset(options)).toEqual(
      createCaldermereDataset(options),
    );
  });

  it("varies generated activity for a different seed and validates both", () => {
    const first = createCaldermereDataset({ seed: 1 });
    const second = createCaldermereDataset({ seed: 2 });

    expect(first.transactions.slice(caldermereDataset.transactions.length)).not.toEqual(
      second.transactions.slice(caldermereDataset.transactions.length),
    );
    expect(validateFinanceDataset(first)).toEqual({ valid: true, errors: [] });
    expect(validateFinanceDataset(second)).toEqual({ valid: true, errors: [] });
  });

  it("rejects seeds outside the unique unsigned 32-bit seed space", () => {
    expect(() => createCaldermereDataset({ seed: -1 })).toThrow(
      "Seed must be an unsigned 32-bit integer.",
    );
    expect(() =>
      createCaldermereDataset({ seed: 4_294_967_297 }),
    ).toThrow("Seed must be an unsigned 32-bit integer.");
  });

  it("uses stable default volumes within the intended ranges", () => {
    const dataset = createCaldermereDataset();

    expect(CALDERMERE_DEFAULT_SEED).toBe(1042);
    expect(dataset.transactions).toHaveLength(1_200);
    expect(dataset.payments).toHaveLength(200);
    expect(dataset.invoices).toHaveLength(120);
    expect(dataset.counterparties).toHaveLength(40);
    expect(dataset.beneficiaries).toHaveLength(32);
    expect(dataset.accounts).toHaveLength(30);
    expect(
      dataset.payments
        .slice(caldermereDataset.payments.length)
        .reduce<Record<string, number>>((counts, payment) => {
          counts[payment.status] = (counts[payment.status] ?? 0) + 1;
          return counts;
        }, {}),
    ).toEqual({ completed: 160, cancelled: 10 });
    expect(
      dataset.invoices
        .slice(caldermereDataset.invoices.length)
        .reduce<Record<string, number>>((counts, invoice) => {
          counts[invoice.status] = (counts[invoice.status] ?? 0) + 1;
          return counts;
        }, {}),
    ).toEqual({
      paid: 55,
      issued: 15,
      "part-paid": 10,
      overdue: 12,
      cancelled: 4,
    });
  });

  it("preserves and does not share mutable anchor records", () => {
    const anchorBefore = JSON.stringify(caldermereDataset);
    const dataset = createCaldermereDataset();

    expect(dataset.accounts.slice(0, caldermereDataset.accounts.length)).toEqual(
      caldermereDataset.accounts,
    );
    expect(dataset.payments.slice(0, caldermereDataset.payments.length)).toEqual(
      caldermereDataset.payments,
    );
    expect(dataset.invoices.slice(0, caldermereDataset.invoices.length)).toEqual(
      caldermereDataset.invoices,
    );
    expect(dataset.transactions.slice(0, caldermereDataset.transactions.length)).toEqual(
      caldermereDataset.transactions,
    );
    dataset.businesses[0]!.legalEntityIds.push("mutation-test");
    dataset.counterparties[0]!.roles.push("supplier");
    expect(JSON.stringify(caldermereDataset)).toBe(anchorBefore);
  });

  it("preserves the current payment and approval summaries", () => {
    const dataset = createCaldermereDataset();

    expect(
      getPaymentSummary(dataset, { businessId, asOf: CALDERMERE_AS_OF }),
    ).toEqual({
      totalPending: 12,
      awaitingApproval: 4,
      scheduled: 5,
      processing: 3,
      failed: 2,
      completedToday: 3,
    });
    expect(getApprovalSummary(dataset, { businessId })).toEqual({
      paymentsAwaitingApproval: 4,
      outstandingApprovalActions: 7,
    });
  });

  it("keeps generated activity on open accounts with matching currencies", () => {
    const dataset = createCaldermereDataset();
    const accounts = new Map(dataset.accounts.map((account) => [account.id, account]));
    const beneficiaries = new Map(
      dataset.beneficiaries.map((beneficiary) => [beneficiary.id, beneficiary]),
    );
    const generatedTransactions = dataset.transactions.slice(
      caldermereDataset.transactions.length,
    );
    const generatedPayments = dataset.payments.slice(caldermereDataset.payments.length);

    for (const transaction of generatedTransactions) {
      const account = accounts.get(transaction.accountId)!;
      expect(account.status).toBe("active");
      expect(transaction.currency).toBe(account.currency);
    }
    for (const payment of generatedPayments) {
      const account = accounts.get(payment.sourceAccountId)!;
      expect(account.status).toBe("active");
      expect(payment.currency).toBe(account.currency);
      expect(payment.currency).toBe(beneficiaries.get(payment.beneficiaryId)!.currency);
    }
  });

  it("uses only safe integer minor-unit money", () => {
    const dataset = createCaldermereDataset();
    const values = [
      ...dataset.transactions.map(({ amountMinor }) => amountMinor),
      ...dataset.payments.map(({ amountMinor }) => amountMinor),
      ...dataset.invoices.flatMap(({ amountMinor, outstandingAmountMinor }) => [
        amountMinor,
        outstandingAmountMinor,
      ]),
      ...dataset.balances.flatMap(
        ({ ledgerBalanceMinor, availableBalanceMinor }) => [
          ledgerBalanceMinor,
          availableBalanceMinor,
        ],
      ),
    ];

    expect(values.every(Number.isSafeInteger)).toBe(true);
  });

  it("keeps generated historical events inside the 90-day window", () => {
    const dataset = createCaldermereDataset();
    const asOfDate = getUtcCalendarDate(CALDERMERE_AS_OF);
    const firstDate = addUtcDays(asOfDate, -89);
    const inHistory = (value: string) => {
      const date = getUtcCalendarDate(value);
      return date >= firstDate && date < asOfDate;
    };

    expect(
      dataset.transactions
        .slice(caldermereDataset.transactions.length)
        .every(({ bookedAt }) => inHistory(bookedAt)),
    ).toBe(true);
    expect(
      dataset.payments
        .slice(caldermereDataset.payments.length)
        .every(
          (payment) =>
            inHistory(payment.createdAt) &&
            inHistory(payment.completedAt ?? payment.cancelledAt!),
        ),
    ).toBe(true);
    expect(
      dataset.invoices
        .slice(caldermereDataset.invoices.length)
        .every(({ issuedAt }) => inHistory(issuedAt)),
    ).toBe(true);
  });

  it("links a substantial set of completed payments to transactions", () => {
    const dataset = createCaldermereDataset();
    const generatedPaymentIds = new Set(
      dataset.payments
        .slice(caldermereDataset.payments.length)
        .filter(({ status }) => status === "completed")
        .map(({ id }) => id),
    );
    const linkedIds = new Set(
      dataset.transactions
        .slice(caldermereDataset.transactions.length)
        .flatMap(({ paymentId }) => paymentId === undefined ? [] : [paymentId]),
    );

    expect(linkedIds).toEqual(generatedPaymentIds);
    expect(linkedIds.size).toBe(160);
  });

  it("has stable currency-separated enriched receivables", () => {
    expect(
      getReceivablesPosition(createCaldermereDataset(), {
        businessId,
        asOf: CALDERMERE_AS_OF,
      }),
    ).toEqual({
      byCurrency: [
        { currency: "GBP", outstandingMinor: 295_541_094, overdueMinor: 135_682_391, invoiceCount: 87, overdueInvoiceCount: 20 },
        { currency: "EUR", outstandingMinor: 40_783_737, overdueMinor: 14_484_316, invoiceCount: 14, overdueInvoiceCount: 3 },
        { currency: "USD", outstandingMinor: 59_205_466, overdueMinor: 46_133_466, invoiceCount: 13, overdueInvoiceCount: 5 },
      ],
    });
  });
});
