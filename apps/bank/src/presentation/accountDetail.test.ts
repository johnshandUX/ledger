import { describe, expect, it } from "vitest";
import type { BankTransaction } from "../finance/transactions";
import { getTransactionAmounts } from "./accountDetail";

describe("account detail presentation", () => {
  it("places unsigned amounts in the column determined by direction", () => {
    const base = { id: "test", accountId: "account", amountMinor: 4275, currency: "GBP", bookedAt: "2026-09-15T10:00:00Z", valueDate: "2026-09-15", description: "Test" } as const;
    expect(getTransactionAmounts({ ...base, direction: "credit" } satisfies BankTransaction)).toEqual({ moneyInMinor: 4275 });
    expect(getTransactionAmounts({ ...base, direction: "debit" } satisfies BankTransaction)).toEqual({ moneyOutMinor: 4275 });
  });
});
