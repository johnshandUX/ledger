import { describe, expect, it } from "vitest";
import { makeTransaction } from "./Transaction";

const baseTransaction = {
  id: "transaction",
  accountId: "account",
  direction: "debit" as const,
  amount: 10,
  postedAt: "2026-09-15T10:00:00Z",
  description: "Supplier payment",
};

describe("makeTransaction monetary invariants", () => {
  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects an invalid unsigned amount (%s)",
    (amount) => {
      expect(() => makeTransaction({ ...baseTransaction, amount })).toThrow("finite and unsigned");
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects a non-finite balance after posting (%s)",
    (balanceAfter) => {
      expect(() => makeTransaction({ ...baseTransaction, balanceAfter })).toThrow("balance after posting must be finite");
    },
  );

  it("allows a legitimate negative balance after posting", () => {
    expect(makeTransaction({ ...baseTransaction, balanceAfter: -125.75 }).balanceAfter).toBe(-125.75);
  });
});
