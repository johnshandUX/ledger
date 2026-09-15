import { describe, expect, it } from "vitest";
import { getAccountAccessForProfile, getAccountsForProfile, getTransactionsForProfileAccount } from "./selectors";

describe("account detail access", () => {
  it("does not expose an account owned by another business", () => {
    expect(getAccountAccessForProfile("bp-alex-northstar", "acc-mg-1")).toEqual({ status: "not-found" });
    expect(getTransactionsForProfileAccount("bp-alex-northstar", "acc-mg-1")).toBeUndefined();
  });

  it("requires account access and transaction permissions independently", () => {
    expect(getAccountAccessForProfile("missing-profile", "acc-ns-op")).toEqual({ status: "not-authorised" });
    expect(getAccountsForProfile("missing-profile")).toEqual([]);
    expect(getAccountAccessForProfile("bp-auditor-northstar", "acc-ns-op")).toMatchObject({ status: "allowed", canViewTransactions: false });
    expect(getTransactionsForProfileAccount("bp-auditor-northstar", "acc-ns-op")).toBeUndefined();
  });

  it("sorts transactions newest first with a stable id tie-break", () => {
    const result = getTransactionsForProfileAccount("bp-alex-northstar", "acc-ns-pay");
    expect(result).toBeDefined();
    expect(result?.map(({ id }) => id)).toEqual(["t-9", "t-8"]);
  });
});
