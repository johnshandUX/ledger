import { describe, expect, it } from "vitest";

import { CALDERMERE_AS_OF, caldermereDataset } from "../datasets/caldermere/index.js";
import type { FinanceDataset } from "../validation/index.js";
import { getAccounts } from "./accounts.js";
import { getBeneficiaries } from "./beneficiaries.js";
import { getCounterparties } from "./counterparties.js";
import { getInvoices, getOverdueInvoices } from "./invoices.js";
import {
  getOutstandingApprovalActions,
  getPaymentApprovals,
} from "./payment-approvals.js";
import {
  getPaymentsAwaitingApproval,
  getPendingPayments,
} from "./payments.js";
import { getTransactions } from "./transactions.js";
import { getUsers, getUsersWithPermission } from "./users.js";

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

describe("entity selectors", () => {
  it("filters accounts while preserving dataset order", () => {
    const sourceOrder = caldermereDataset.accounts.map(({ id }) => id);
    const accounts = getAccounts(caldermereDataset, {
      currency: "EUR",
      status: "active",
    });

    expect(accounts.map(({ id }) => id)).toEqual([
      "account-eur-operating",
      "account-eur-receipts",
      "account-eur-supplier-payments",
    ]);
    expect(caldermereDataset.accounts.map(({ id }) => id)).toEqual(sourceOrder);
  });

  it("filters and orders transactions newest first with inclusive value dates", () => {
    const sourceOrder = caldermereDataset.transactions.map(({ id }) => id);
    const transactions = getTransactions(caldermereDataset, {
      businessId: "business-caldermere",
      currency: "GBP",
      direction: "credit",
      from: "2026-10-07",
      to: "2026-10-07",
    });

    expect(transactions.map(({ id }) => id)).toEqual([
      "transaction-004",
      "transaction-003",
      "transaction-002",
      "transaction-001",
      "transaction-030",
    ]);
    expect(caldermereDataset.transactions.map(({ id }) => id)).toEqual(sourceOrder);
  });

  it("derives user permissions through roles", () => {
    const dataset = emptyDataset();
    dataset.permissions = [
      { id: "permission-approve", key: "payments:approve" },
      { id: "permission-view", key: "accounts:view" },
    ];
    dataset.roles = [
      { id: "role-approver", businessId: "business-1", name: "Approver", permissionIds: ["permission-approve"] },
      { id: "role-viewer", businessId: "business-1", name: "Viewer", permissionIds: ["permission-view"] },
    ];
    dataset.users = [
      { id: "user-viewer", businessId: "business-1", firstName: "Vera", lastName: "Viewer", email: "vera@example.test", roleIds: ["role-viewer"], status: "active" },
      { id: "user-approver", businessId: "business-1", firstName: "Ada", lastName: "Approver", email: "ada@example.test", roleIds: ["role-approver"], status: "active" },
    ];

    expect(getUsersWithPermission(dataset, "payments:approve").map(({ id }) => id))
      .toEqual(["user-approver"]);
    expect(getUsers(dataset, { roleId: "role-viewer" }).map(({ id }) => id))
      .toEqual(["user-viewer"]);
  });

  it("filters counterparties and beneficiaries without adding categories", () => {
    expect(getCounterparties(caldermereDataset, { role: "supplier" })).toHaveLength(14);
    expect(getBeneficiaries(caldermereDataset, { currency: "EUR" }).map(({ id }) => id))
      .toEqual(["beneficiary-valence-france"]);
    expect(getBeneficiaries(caldermereDataset, { counterpartyId: "counterparty-apex-steel" }))
      .toHaveLength(1);
  });
});

describe("payment and invoice selectors", () => {
  it("derives pending and awaiting-approval payments from payment status", () => {
    const sourceOrder = caldermereDataset.payments.map(({ id }) => id);

    expect(getPendingPayments(caldermereDataset, { businessId: "business-caldermere" }))
      .toHaveLength(12);
    expect(
      getPaymentsAwaitingApproval(caldermereDataset, {
        businessId: "business-caldermere",
      }),
    ).toHaveLength(4);
    expect(caldermereDataset.payments.map(({ id }) => id)).toEqual(sourceOrder);
  });

  it("filters approval actions by related payment business", () => {
    expect(
      getPaymentApprovals(caldermereDataset, { businessId: "business-caldermere" }),
    ).toHaveLength(11);
    expect(
      getOutstandingApprovalActions(caldermereDataset, {
        businessId: "business-caldermere",
      }),
    ).toHaveLength(7);
  });

  it("derives overdue invoices from explicit time and values, not stored status", () => {
    const dataset = emptyDataset();
    dataset.invoices = [
      { id: "invoice-derived-overdue", businessId: "business-1", counterpartyId: "counterparty-1", invoiceNumber: "INV-1", issuedAt: "2026-01-01", dueAt: "2026-01-31", amountMinor: 10_000, outstandingAmountMinor: 5_000, currency: "GBP", status: "issued" },
      { id: "invoice-stored-overdue-future", businessId: "business-1", counterpartyId: "counterparty-1", invoiceNumber: "INV-2", issuedAt: "2026-09-01", dueAt: "2026-12-01", amountMinor: 20_000, outstandingAmountMinor: 20_000, currency: "GBP", status: "overdue" },
      { id: "invoice-paid", businessId: "business-1", counterpartyId: "counterparty-1", invoiceNumber: "INV-3", issuedAt: "2026-01-01", dueAt: "2026-01-31", amountMinor: 30_000, outstandingAmountMinor: 0, currency: "GBP", status: "paid" },
    ];

    expect(
      getOverdueInvoices(dataset, {
        businessId: "business-1",
        asOf: CALDERMERE_AS_OF,
      }).map(({ id }) => id),
    ).toEqual(["invoice-derived-overdue"]);
    expect(getInvoices(dataset, { status: "overdue" }).map(({ id }) => id))
      .toEqual(["invoice-stored-overdue-future"]);
  });
});
