import { describe, expect, it } from "vitest";
import { additionalAccessCatalogue, type User } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../finance/environment";
import {
  createBankUserPresentations,
  NO_ADDITIONAL_ACCESS_FILTER_VALUE,
  UNASSIGNED_ROLE_FILTER_VALUE,
} from "./users";

describe("People and access user presentation adapter", () => {
  it("joins every user to authoritative role and additional-access catalogues", () => {
    const rows = createBankUserPresentations(
      bankFinanceEnvironment.users,
      bankFinanceEnvironment.roles,
      additionalAccessCatalogue,
    );

    expect(rows).toHaveLength(bankFinanceEnvironment.users.length);
    expect(rows.find(({ id }) => id === "user-amelia-hart")).toMatchObject({
      bankingRoleLabel: "Administrator",
      bankingRoleFilterValue: "role-administrator",
      additionalAccessLabel: "Developer",
      additionalAccessFilterValues: ["developer"],
    });
    expect(rows.find(({ id }) => id === "user-noah-wilson")).toMatchObject({
      bankingRoleLabel: "Unassigned",
      bankingRoleFilterValue: UNASSIGNED_ROLE_FILTER_VALUE,
      bankingRoleSortValue: null,
      additionalAccessLabel: "Developer",
    });
    expect(rows.find(({ id }) => id === "user-sophie-bennett")?.additionalAccessFilterValues)
      .toEqual([NO_ADDITIONAL_ACCESS_FILTER_VALUE]);
    expect(rows.find(({ status }) => status === "suspended")).toMatchObject({
      statusLabel: "Suspended",
      detailRoute: "/admin/people-access/users/user-lewis-wright",
      searchValues: ["Lewis Wright", "lewis.wright@caldermere.example"],
    });
  });

  it("supports effective-state created and updated records without mutating its inputs", () => {
    const baseline = bankFinanceEnvironment.users[0]!;
    const created = {
      ...baseline,
      id: "user-future-created",
      firstName: "Future",
      lastName: "User",
      email: "future.user@caldermere.example",
      roleIds: ["role-viewer"],
      additionalAccessIds: [],
    } as User;
    const updated = { ...baseline, firstName: "Updated", roleIds: [] } as User;
    const users = [created, updated] as const;
    const snapshot = JSON.stringify(users);

    const rows = createBankUserPresentations(users, bankFinanceEnvironment.roles, additionalAccessCatalogue);

    expect(rows.map(({ fullName }) => fullName)).toEqual(["Future User", `Updated ${baseline.lastName}`]);
    expect(rows[0]).toMatchObject({ bankingRoleLabel: "Viewer", detailRoute: "/admin/people-access/users/user-future-created" });
    expect(rows[1]?.bankingRoleFilterValue).toBe(UNASSIGNED_ROLE_FILTER_VALUE);
    expect(JSON.stringify(users)).toBe(snapshot);
  });
});
