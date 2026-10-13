import type { AdditionalAccessDefinition, Role, User } from "@johnshandux/ledger-synthetic-finance";

type UserPresentationSource = Readonly<Omit<User, "roleIds" | "additionalAccessIds">> & Readonly<{
  roleIds: readonly string[];
  additionalAccessIds: readonly string[];
}>;

type RolePresentationSource = Readonly<Pick<Role, "id" | "name">>;

type AdditionalAccessPresentationSource = Readonly<Pick<AdditionalAccessDefinition, "id" | "name">>;

export const UNASSIGNED_ROLE_FILTER_VALUE = "unassigned";
export const NO_ADDITIONAL_ACCESS_FILTER_VALUE = "none";

export type BankUserPresentation = Readonly<{
  id: string;
  fullName: string;
  email: string;
  bankingRoleLabel: string;
  bankingRoleFilterValue: string;
  bankingRoleSortValue: string | null;
  additionalAccessLabel: string;
  additionalAccessFilterValues: readonly string[];
  additionalAccessSortValue: string;
  status: User["status"];
  statusLabel: string;
  detailRoute: string;
  searchValues: readonly string[];
}>;

export function createBankUserPresentations(
  users: readonly UserPresentationSource[],
  roles: readonly RolePresentationSource[],
  additionalAccess: readonly AdditionalAccessPresentationSource[],
): BankUserPresentation[] {
  const rolesById = new Map<string, RolePresentationSource>(roles.map((role) => [role.id, role]));
  const accessById = new Map<string, AdditionalAccessPresentationSource>(additionalAccess.map((access) => [access.id, access]));

  return users.map((user) => {
    const role = user.roleIds.map((roleId) => rolesById.get(roleId)).find(Boolean);
    const assignedAccess = user.additionalAccessIds
      .map((accessId) => accessById.get(accessId))
      .filter((access): access is AdditionalAccessPresentationSource => access !== undefined);
    const fullName = `${user.firstName} ${user.lastName}`;
    const additionalAccessLabel = assignedAccess.length > 0
      ? assignedAccess.map(({ name }) => name).join(", ")
      : "None";

    return {
      id: user.id,
      fullName,
      email: user.email,
      bankingRoleLabel: role?.name ?? "Unassigned",
      bankingRoleFilterValue: role?.id ?? UNASSIGNED_ROLE_FILTER_VALUE,
      bankingRoleSortValue: role?.name ?? null,
      additionalAccessLabel,
      additionalAccessFilterValues: assignedAccess.length > 0
        ? assignedAccess.map(({ id }) => id)
        : [NO_ADDITIONAL_ACCESS_FILTER_VALUE],
      additionalAccessSortValue: additionalAccessLabel,
      status: user.status,
      statusLabel: user.status === "active" ? "Active" : "Suspended",
      detailRoute: `/admin/people-access/users/${user.id}`,
      searchValues: [fullName, user.email],
    };
  });
}
