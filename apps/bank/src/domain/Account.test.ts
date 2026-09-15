import { describe, expect, it } from "vitest";
import { makeAccount } from "./Account";

const baseAccount = {
  id: "account",
  businessId: "business",
  name: "Operating account",
  accountNumber: "12345678",
  sortCode: "12-34-56",
  type: "current" as const,
  currentBalance: 100,
  availableBalance: 80,
  balancesUpdatedAt: "2026-09-15T10:00:00Z",
};

describe("makeAccount monetary invariants", () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects a non-finite current balance (%s)",
    (currentBalance) => {
      expect(() => makeAccount({ ...baseAccount, currentBalance })).toThrow("current balance must be finite");
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects a non-finite available balance (%s)",
    (availableBalance) => {
      expect(() => makeAccount({ ...baseAccount, availableBalance })).toThrow("available balance must be finite");
    },
  );

  it("allows legitimate negative account balances", () => {
    const account = makeAccount({ ...baseAccount, currentBalance: -250.5, availableBalance: -300 });
    expect(account.currentBalance).toBe(-250.5);
    expect(account.availableBalance).toBe(-300);
  });
});
