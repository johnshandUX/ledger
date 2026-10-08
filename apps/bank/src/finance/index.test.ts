import { describe, expect, it } from "vitest";
import {
  createCaldermereScenario,
  getApprovalSummary,
  getPaymentSummary,
  CALDERMERE_AS_OF,
} from "@johnshandux/ledger-synthetic-finance";

import {
  BANK_BUSINESS_ID,
  bankFinanceEnvironment,
} from "./environment";
import {
  getBankAccountById,
  getBankAccounts,
} from "./accounts";
import {
  getBankApprovalSummary,
  getBankPaymentSummary,
} from "./payments";
import {
  BANK_RECENT_TRANSACTION_LIMIT,
  getBankTransactionsForAccount,
} from "./transactions";
import {
  BANK_DEMO_USER_ID,
  getBankDemoUser,
  getBankUsersWithPermission,
} from "./users";

describe("Ledger Bank finance adapter", () => {
  it("uses the normal-trading Caldermere environment", () => {
    expect(bankFinanceEnvironment).toEqual(
      createCaldermereScenario({ scenario: "normal-trading" }),
    );
    expect(getBankAccounts()).toHaveLength(30);
  });

  it("resolves account detail and current balances from shared finance", () => {
    const restricted = getBankAccounts().find(({ status }) => status === "restricted")!;
    const closed = getBankAccounts().find(({ status }) => status === "closed")!;

    expect(getBankAccountById(restricted.id)).toMatchObject({ status: "restricted" });
    expect(getBankAccountById(closed.id)).toMatchObject({ status: "closed" });
    expect(Number.isSafeInteger(restricted.availableBalanceMinor)).toBe(true);
  });

  it("returns recent Caldermere transactions in selector order", () => {
    const transactions = getBankTransactionsForAccount("account-main-operating");
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions.length).toBeLessThanOrEqual(BANK_RECENT_TRANSACTION_LIMIT);
    expect(transactions.every(({ accountId }) => accountId === "account-main-operating")).toBe(true);
    expect(
      transactions.every((transaction, index) =>
        index === 0 || transactions[index - 1]!.bookedAt >= transaction.bookedAt),
    ).toBe(true);
  });

  it("delegates payment and approval meaning to synthetic-finance", () => {
    const direct = { businessId: BANK_BUSINESS_ID, asOf: CALDERMERE_AS_OF };
    expect(getBankPaymentSummary()).toEqual(
      getPaymentSummary(bankFinanceEnvironment, direct),
    );
    expect(getBankApprovalSummary()).toEqual(
      getApprovalSummary(bankFinanceEnvironment, direct),
    );
  });

  it("maps the deterministic demo identity to Caldermere", () => {
    expect(getBankDemoUser().id).toBe(BANK_DEMO_USER_ID);
    expect(getBankUsersWithPermission("payments:approve")).toContainEqual(
      getBankDemoUser(),
    );
  });
});
