import { describe, expect, it } from "vitest";
import { bankFinanceEnvironment } from "../finance/environment";
import { createAdminUserSummary } from "./adminOverview";

describe("Administration user summary", () => {
  it("derives totals, active users and banking-role assignments independently", () => {
    expect(createAdminUserSummary(bankFinanceEnvironment.users)).toEqual({
      totalUsers: 18,
      activeUsers: 17,
      usersWithBankingRoles: 17,
    });
    expect(createAdminUserSummary([
      { status: "active", roleIds: [] },
      { status: "suspended", roleIds: ["role-administrator"] },
    ])).toEqual({ totalUsers: 2, activeUsers: 1, usersWithBankingRoles: 1 });
  });

  it("returns an empty summary without manufacturing values", () => {
    expect(createAdminUserSummary([])).toEqual({
      totalUsers: 0,
      activeUsers: 0,
      usersWithBankingRoles: 0,
    });
  });
});
