import { describe, expect, it } from "vitest";
import { additionalAccessCatalogue, type User } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../finance/environment";
import {
  createBankUserPresentation,
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
      jobTitle: "Finance Director",
      jobTitleLabel: "Finance Director",
      bankingRole: {
        name: "Administrator",
        description: "Full banking and administrative access.",
      },
      bankingRoleLabel: "Administrator",
      bankingRoleFilterValue: "role-administrator",
      displayRole: { label: "Administrator", source: "banking-role" },
      additionalAccessLabel: "Developer",
      additionalAccessFilterValues: ["developer"],
    });
    expect(rows.find(({ id }) => id === "user-noah-wilson")).toMatchObject({
      bankingRoleLabel: "Unassigned",
      bankingRoleFilterValue: UNASSIGNED_ROLE_FILTER_VALUE,
      bankingRoleSortValue: null,
      additionalAccessLabel: "Developer",
      displayRole: { label: "Developer", source: "additional-access" },
    });
    expect(rows.find(({ id }) => id === "user-sophie-bennett")?.additionalAccessFilterValues)
      .toEqual([NO_ADDITIONAL_ACCESS_FILTER_VALUE]);
    expect(rows.find(({ status }) => status === "suspended")).toMatchObject({
      statusLabel: "Suspended",
      detailRoute: "/admin/people-access/users/user-lewis-wright",
      searchValues: ["Lewis Wright", "lewis.wright@caldermere.example", "Payment operator"],
    });
  });

  it("keeps banking roles, additional access and derived display roles distinct", () => {
    const withBoth = createBankUserPresentation(
      bankFinanceEnvironment.users.find(({ id }) => id === "user-amelia-hart")!,
      bankFinanceEnvironment.roles,
      additionalAccessCatalogue,
    );
    const developerOnly = createBankUserPresentation(
      bankFinanceEnvironment.users.find(({ id }) => id === "user-noah-wilson")!,
      bankFinanceEnvironment.roles,
      additionalAccessCatalogue,
    );
    const unassigned = createBankUserPresentation(
      { ...bankFinanceEnvironment.users[0]!, roleIds: [], additionalAccessIds: [] },
      bankFinanceEnvironment.roles,
      additionalAccessCatalogue,
    );

    expect(withBoth.displayRole).toMatchObject({ label: "Administrator", source: "banking-role" });
    expect(withBoth.bankingRole?.name).toBe("Administrator");
    expect(withBoth.additionalAccess.map(({ name }) => name)).toEqual(["Developer"]);
    expect(developerOnly.displayRole).toMatchObject({ label: "Developer", source: "additional-access" });
    expect(developerOnly.bankingRole).toBeUndefined();
    expect(developerOnly.additionalAccess[0]?.description).toBe("Access to developer tools, banking APIs and integrations.");
    expect(unassigned.displayRole).toEqual({ label: "Unassigned", source: "unassigned" });
  });

  it("presents optional job titles separately from their display fallback", () => {
    const source = bankFinanceEnvironment.users[0]!;
    expect(createBankUserPresentation(source, bankFinanceEnvironment.roles, additionalAccessCatalogue))
      .toMatchObject({ jobTitle: "Finance Director", jobTitleLabel: "Finance Director" });
    expect(createBankUserPresentation(
      { ...source, jobTitle: "" },
      bankFinanceEnvironment.roles,
      additionalAccessCatalogue,
    )).toMatchObject({ jobTitle: undefined, jobTitleLabel: "Not provided" });
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
    const updated = { ...baseline, firstName: "Updated", jobTitle: "Updated title", roleIds: [] } as User;
    const users = [created, updated] as const;
    const snapshot = JSON.stringify(users);

    const rows = createBankUserPresentations(users, bankFinanceEnvironment.roles, additionalAccessCatalogue);

    expect(rows.map(({ fullName }) => fullName)).toEqual(["Future User", `Updated ${baseline.lastName}`]);
    expect(rows[0]).toMatchObject({ bankingRoleLabel: "Viewer", detailRoute: "/admin/people-access/users/user-future-created" });
    expect(rows[1]).toMatchObject({
      jobTitle: "Updated title",
      bankingRoleFilterValue: UNASSIGNED_ROLE_FILTER_VALUE,
      displayRole: { label: "Developer", source: "additional-access" },
    });
    expect(JSON.stringify(users)).toBe(snapshot);
  });
});
