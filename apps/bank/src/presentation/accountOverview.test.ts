import { describe, expect, it } from "vitest";
import { makeAccount } from "../domain/Account";
import { getBalanceTotalsByCurrency } from "./accountOverview";

const common = {
  businessId: "business",
  accountNumber: "12345678",
  sortCode: "12-34-56",
  type: "current" as const,
  balancesUpdatedAt: "2026-09-15T08:42:00Z",
};

describe("getBalanceTotalsByCurrency", () => {
  it("keeps unlike currencies in separate totals", () => {
    const totals = getBalanceTotalsByCurrency([
      makeAccount({ ...common, id: "gbp", name: "GBP account", currency: "GBP", currentBalance: 10, availableBalance: 8 }),
      makeAccount({ ...common, id: "usd", name: "USD account", currency: "USD", currentBalance: 20, availableBalance: 18 }),
      makeAccount({ ...common, id: "gbp-2", name: "Second GBP account", currency: "GBP", currentBalance: 5, availableBalance: 4 }),
    ]);

    expect(totals).toEqual([
      { currency: "GBP", current: 15, available: 12 },
      { currency: "USD", current: 20, available: 18 },
    ]);
  });
});
