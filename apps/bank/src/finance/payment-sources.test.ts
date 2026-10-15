import { describe, expect, it } from "vitest";

import { getBankAccounts } from "./accounts";
import { getPaymentSourceEligibility, isEligiblePaymentSourceAccount } from "./payment-sources";

describe("payment source eligibility", () => {
  const accounts = getBankAccounts();

  it("accepts active GBP current accounts with account details", () => {
    const account = accounts.find(({ id }) => id === "account-main-operating")!;

    expect(getPaymentSourceEligibility(account)).toEqual({ eligible: true });
    expect(isEligiblePaymentSourceAccount(account)).toBe(true);
  });

  it.each([
    ["restricted", "account-restricted-project", "restricted account"],
    ["closed", "account-historical-plant", "closed account"],
    ["deposit", "account-instant-access-reserve", "current accounts"],
    ["currency", "account-usd-operating", "GBP accounts"],
  ])("explains %s account ineligibility", (_case, accountId, message) => {
    const account = accounts.find(({ id }) => id === accountId)!;
    const eligibility = getPaymentSourceEligibility(account);

    expect(eligibility.eligible).toBe(false);
    if (!eligibility.eligible) expect(eligibility.reason).toContain(message);
  });
});
