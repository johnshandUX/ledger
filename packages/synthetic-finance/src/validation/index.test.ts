import { describe, expect, it } from "vitest";

import type { FinanceDataset } from "../index.js";
import { validateFinanceDataset } from "../index.js";

function createValidDataset(): FinanceDataset {
  return {
    businesses: [
      { id: "business-1", name: "Caldermere", legalEntityIds: ["entity-1"] },
    ],
    legalEntities: [
      { id: "entity-1", businessId: "business-1", name: "Caldermere" },
    ],
    permissions: [{ id: "permission-1", key: "payments:approve" }],
    roles: [
      {
        id: "role-1",
        businessId: "business-1",
        name: "Approver",
        permissionIds: ["permission-1"],
      },
    ],
    users: [
      {
        id: "user-1",
        businessId: "business-1",
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex@example.test",
        roleIds: ["role-1"],
        status: "active",
      },
    ],
    accounts: [
      {
        id: "account-1",
        businessId: "business-1",
        legalEntityId: "entity-1",
        name: "Main Account",
        accountType: "current",
        currency: "GBP",
        status: "active",
      },
    ],
    balances: [
      {
        id: "balance-1",
        accountId: "account-1",
        asOf: "2026-10-07T09:00:00.000Z",
        ledgerBalanceMinor: 100_000,
        availableBalanceMinor: 90_000,
        currency: "GBP",
      },
    ],
    counterparties: [
      {
        id: "counterparty-1",
        businessId: "business-1",
        name: "Supplier Ltd",
        type: "organisation",
        roles: ["supplier"],
      },
    ],
    beneficiaries: [
      {
        id: "beneficiary-1",
        businessId: "business-1",
        counterpartyId: "counterparty-1",
        name: "Supplier Ltd",
        accountName: "Supplier Ltd",
        accountNumber: "12345678",
        sortCode: "123456",
        currency: "GBP",
      },
    ],
    payments: [
      {
        id: "payment-1",
        businessId: "business-1",
        sourceAccountId: "account-1",
        beneficiaryId: "beneficiary-1",
        amountMinor: 10_000,
        currency: "GBP",
        reference: "INV-001",
        status: "awaiting-approval",
        createdByUserId: "user-1",
        createdAt: "2026-10-07T08:00:00.000Z",
      },
    ],
    paymentApprovals: [
      {
        id: "approval-1",
        paymentId: "payment-1",
        approverUserId: "user-1",
        status: "pending",
        createdAt: "2026-10-07T08:01:00.000Z",
      },
    ],
    transactions: [
      {
        id: "transaction-1",
        accountId: "account-1",
        bookedAt: "2026-10-07T10:00:00.000Z",
        valueDate: "2026-10-07",
        amountMinor: 10_000,
        currency: "GBP",
        direction: "debit",
        description: "Supplier payment",
        counterpartyId: "counterparty-1",
        paymentId: "payment-1",
      },
    ],
    invoices: [
      {
        id: "invoice-1",
        businessId: "business-1",
        counterpartyId: "counterparty-1",
        invoiceNumber: "INV-001",
        issuedAt: "2026-09-07",
        dueAt: "2026-10-07",
        amountMinor: 10_000,
        outstandingAmountMinor: 10_000,
        currency: "GBP",
        status: "issued",
      },
    ],
  };
}

describe("validateFinanceDataset", () => {
  it("accepts a dataset whose references are valid", () => {
    expect(validateFinanceDataset(createValidDataset())).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("reports broken required and optional references", () => {
    const dataset = createValidDataset();
    dataset.accounts[0]!.legalEntityId = "missing-entity";
    dataset.transactions[0]!.counterpartyId = "missing-counterparty";
    dataset.payments[0]!.createdByUserId = "missing-user";
    dataset.paymentApprovals[0]!.paymentId = "missing-payment";

    const result = validateFinanceDataset(dataset);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "accounts[0].legalEntityId" }),
        expect.objectContaining({ path: "transactions[0].counterpartyId" }),
        expect.objectContaining({ path: "payments[0].createdByUserId" }),
        expect.objectContaining({ path: "paymentApprovals[0].paymentId" }),
      ]),
    );
  });

  it("reports references that cross business boundaries", () => {
    const dataset = createValidDataset();
    dataset.businesses.push({
      id: "business-2",
      name: "Other Business",
      legalEntityIds: [],
    });
    dataset.accounts[0]!.businessId = "business-2";
    dataset.payments[0]!.businessId = "business-2";
    dataset.invoices[0]!.businessId = "business-2";

    const result = validateFinanceDataset(dataset);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      path: "accounts[0].legalEntityId",
      message:
        'LegalEntity "entity-1" belongs to Business "business-1", not "business-2".',
    });
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "payments[0].beneficiaryId" }),
        expect.objectContaining({ path: "payments[0].createdByUserId" }),
        expect.objectContaining({ path: "paymentApprovals[0].approverUserId" }),
        expect.objectContaining({ path: "invoices[0].counterpartyId" }),
      ]),
    );
  });

  it("reports duplicate entity ids", () => {
    const dataset = createValidDataset();
    dataset.accounts.push({ ...dataset.accounts[0]! });

    const result = validateFinanceDataset(dataset);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      path: "accounts[1].id",
      message: 'Duplicate id "account-1" in accounts.',
    });
  });

  it("rejects fractional monetary values", () => {
    const dataset = createValidDataset();
    dataset.payments[0]!.amountMinor = 10_000.5;

    const result = validateFinanceDataset(dataset);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      path: "payments[0].amountMinor",
      message:
        "Monetary value must be a safe integer in minor units; received 10000.5.",
    });
  });

  it("rejects currencies that conflict with referenced accounts or beneficiaries", () => {
    const dataset = createValidDataset();
    dataset.balances[0]!.currency = "USD";
    dataset.transactions[0]!.currency = "EUR";
    dataset.payments[0]!.currency = "USD";

    const result = validateFinanceDataset(dataset);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        {
          path: "balances[0].currency",
          message:
            'Balance currency "USD" does not match Account "account-1" currency "GBP".',
        },
        {
          path: "transactions[0].currency",
          message:
            'Transaction currency "EUR" does not match Account "account-1" currency "GBP".',
        },
        {
          path: "payments[0].currency",
          message:
            'Payment currency "USD" does not match Account "account-1" currency "GBP".',
        },
        {
          path: "payments[0].currency",
          message:
            'Payment currency "USD" does not match Beneficiary "beneficiary-1" currency "GBP".',
        },
      ]),
    );
  });
});
