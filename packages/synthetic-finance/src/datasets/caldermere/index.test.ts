import { describe, expect, it } from "vitest";

import { validateFinanceDataset } from "../../validation/index.js";
import { CALDERMERE_AS_OF, caldermereDataset } from "./index.js";

describe("caldermereDataset", () => {
  it("is a valid single-business, single-entity anchor dataset", () => {
    expect(caldermereDataset.businesses).toHaveLength(1);
    expect(caldermereDataset.legalEntities).toHaveLength(1);
    expect(caldermereDataset.accounts).toHaveLength(30);
    expect(validateFinanceDataset(caldermereDataset)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("has one current balance snapshot for every account", () => {
    expect(caldermereDataset.balances).toHaveLength(caldermereDataset.accounts.length);
    expect(new Set(caldermereDataset.balances.map(({ accountId }) => accountId)).size)
      .toBe(caldermereDataset.accounts.length);
    expect(caldermereDataset.balances.every(({ asOf }) => asOf === CALDERMERE_AS_OF))
      .toBe(true);
  });

  it("has a varied 30-account commercial estate", () => {
    const countBy = (key: "currency" | "status" | "accountType") =>
      caldermereDataset.accounts.reduce<Record<string, number>>((counts, account) => {
        counts[account[key]] = (counts[account[key]] ?? 0) + 1;
        return counts;
      }, {});

    expect(countBy("currency")).toEqual({ GBP: 24, USD: 3, EUR: 3 });
    expect(countBy("status")).toEqual({ active: 28, restricted: 1, closed: 1 });
    expect(countBy("accountType")).toEqual({
      current: 19,
      deposit: 4,
      currency: 6,
      restricted: 1,
    });
    expect(new Set(caldermereDataset.accounts.map(({ name }) => name)).size).toBe(30);
  });

  it("keeps currencies aligned across account-linked records", () => {
    const accounts = new Map(
      caldermereDataset.accounts.map((account) => [account.id, account]),
    );
    const beneficiaries = new Map(
      caldermereDataset.beneficiaries.map((beneficiary) => [beneficiary.id, beneficiary]),
    );

    expect(
      caldermereDataset.balances.every(
        (balance) => accounts.get(balance.accountId)?.currency === balance.currency,
      ),
    ).toBe(true);
    expect(
      caldermereDataset.transactions.every(
        (transaction) =>
          accounts.get(transaction.accountId)?.currency === transaction.currency,
      ),
    ).toBe(true);
    expect(
      caldermereDataset.payments.every(
        (payment) =>
          accounts.get(payment.sourceAccountId)?.currency === payment.currency &&
          beneficiaries.get(payment.beneficiaryId)?.currency === payment.currency,
      ),
    ).toBe(true);
  });

  it("has the designed payment and approval state distribution", () => {
    const countStatus = (status: string) =>
      caldermereDataset.payments.filter((payment) => payment.status === status).length;
    const completedToday = caldermereDataset.payments.filter(
      (payment) => payment.completedAt?.slice(0, 10) === CALDERMERE_AS_OF.slice(0, 10),
    );

    expect(countStatus("awaiting-approval")).toBe(4);
    expect(countStatus("scheduled")).toBe(5);
    expect(countStatus("processing")).toBe(3);
    expect(countStatus("failed")).toBe(2);
    expect(completedToday).toHaveLength(3);
    expect(
      countStatus("awaiting-approval") +
        countStatus("scheduled") +
        countStatus("processing"),
    ).toBe(12);
    expect(
      caldermereDataset.paymentApprovals.filter(({ status }) => status === "pending"),
    ).toHaveLength(7);
  });

  it("uses lifecycle timestamps consistently", () => {
    for (const payment of caldermereDataset.payments) {
      expect(payment.status === "scheduled" ? payment.scheduledFor : true).toBeTruthy();
      expect(payment.status === "failed" ? payment.failedAt : true).toBeTruthy();
      expect(payment.status === "completed" ? payment.completedAt : true).toBeTruthy();
      expect(payment.status === "cancelled" ? payment.cancelledAt : true).toBeTruthy();
    }
  });

  it("assigns approval actions only to payment approvers", () => {
    const permissionsByRole = new Map(
      caldermereDataset.roles.map((role) => [role.id, role.permissionIds]),
    );
    const approverIds = new Set(
      caldermereDataset.users
        .filter((user) =>
          user.roleIds.some((roleId) =>
            permissionsByRole.get(roleId)?.includes("permission-payments-approve"),
          ),
        )
        .map(({ id }) => id),
    );

    expect(
      caldermereDataset.paymentApprovals.every(({ approverUserId }) =>
        approverIds.has(approverUserId),
      ),
    ).toBe(true);
    expect(
      new Set(caldermereDataset.paymentApprovals.map(({ paymentId }) => paymentId)),
    ).toEqual(
      new Set(
        caldermereDataset.payments
          .filter(({ status }) => status === "awaiting-approval")
          .map(({ id }) => id),
      ),
    );
  });

  it("keeps invoice outstanding amounts consistent with status", () => {
    for (const invoice of caldermereDataset.invoices) {
      expect(Number.isSafeInteger(invoice.amountMinor)).toBe(true);
      expect(Number.isSafeInteger(invoice.outstandingAmountMinor)).toBe(true);
      if (invoice.status === "paid" || invoice.status === "cancelled") {
        expect(invoice.outstandingAmountMinor).toBe(0);
      }
      if (invoice.status === "part-paid") {
        expect(invoice.outstandingAmountMinor).toBeGreaterThan(0);
        expect(invoice.outstandingAmountMinor).toBeLessThan(invoice.amountMinor);
      }
      if (invoice.status === "overdue") {
        expect(invoice.outstandingAmountMinor).toBeGreaterThan(0);
      }
    }
  });
});
