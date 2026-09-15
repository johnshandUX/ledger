import { describe, expect, it } from "vitest";
import { makeTransaction } from "../domain/Transaction";
import { getTransactionAmounts } from "./accountDetail";

describe("account detail presentation", () => {
  it("places unsigned amounts in the column determined by direction", () => {
    const base = { id: "test", accountId: "account", amount: 42.75, postedAt: "2026-09-15T10:00:00Z", description: "Test" };
    expect(getTransactionAmounts(makeTransaction({ ...base, direction: "credit" }))).toEqual({ moneyIn: 42.75 });
    expect(getTransactionAmounts(makeTransaction({ ...base, direction: "debit" }))).toEqual({ moneyOut: 42.75 });
  });
});
