import type { AdditionalAccessDefinition, Role, User } from "@johnshandux/ledger-synthetic-finance";

type UserPresentationSource = Readonly<Omit<User, "roleIds" | "additionalAccessIds">> & Readonly<{
  roleIds: readonly string[];
  additionalAccessIds: readonly string[];
}>;

type RolePresentationSource = Readonly<Pick<Role, "id" | "name" | "description">>;

type AdditionalAccessPresentationSource = Readonly<Pick<AdditionalAccessDefinition, "id" | "name" | "description">>;

export const UNASSIGNED_ROLE_FILTER_VALUE = "unassigned";
export const NO_ADDITIONAL_ACCESS_FILTER_VALUE = "none";

export type BankUserRolePresentation = Readonly<{
  id: string;
  name: string;
  description: string;
}>;

export type BankUserAdditionalAccessPresentation = Readonly<{
  id: string;
  name: string;
  description: string;
}>;

export type BankUserDisplayRole = Readonly<{
  label: string;
  source: "banking-role" | "additional-access" | "unassigned";
  sourceId?: string;
}>;

export type BankUserPresentation = Readonly<{
  id: string;
  fullName: string;
  email: string;
  jobTitle?: string;
  jobTitleLabel: string;
  bankingRole?: BankUserRolePresentation;
  bankingRoleLabel: string;
  bankingRoleFilterValue: string;
  bankingRoleSortValue: string | null;
  additionalAccess: readonly BankUserAdditionalAccessPresentation[];
  additionalAccessLabel: string;
  additionalAccessFilterValues: readonly string[];
  additionalAccessSortValue: string;
  displayRole: BankUserDisplayRole;
  status: User["status"];
  statusLabel: string;
  detailRoute: string;
  searchValues: readonly string[];
}>;

export function createBankUserPresentation(
  user: UserPresentationSource,
  roles: readonly RolePresentationSource[],
  additionalAccessCatalogue: readonly AdditionalAccessPresentationSource[],
): BankUserPresentation {
  const assignedRoleIds = new Set(user.roleIds);
  const bankingRole = roles.find(({ id }) => assignedRoleIds.has(id));
  const assignedAccessIds = new Set(user.additionalAccessIds);
  const additionalAccess = additionalAccessCatalogue.filter(({ id }) => assignedAccessIds.has(id));
  const fullName = `${user.firstName} ${user.lastName}`;
  const jobTitle = user.jobTitle?.trim() || undefined;
  const additionalAccessLabel = additionalAccess.length > 0
    ? additionalAccess.map(({ name }) => name).join(", ")
    : "None";
  const displayRole: BankUserDisplayRole = bankingRole
    ? { label: bankingRole.name, source: "banking-role", sourceId: bankingRole.id }
    : additionalAccess[0]
      ? { label: additionalAccess[0].name, source: "additional-access", sourceId: additionalAccess[0].id }
      : { label: "Unassigned", source: "unassigned" };

  return {
    id: user.id,
    fullName,
    email: user.email,
    jobTitle,
    jobTitleLabel: jobTitle ?? "Not provided",
    bankingRole,
    bankingRoleLabel: bankingRole?.name ?? "Unassigned",
    bankingRoleFilterValue: bankingRole?.id ?? UNASSIGNED_ROLE_FILTER_VALUE,
    bankingRoleSortValue: bankingRole?.name ?? null,
    additionalAccess,
    additionalAccessLabel,
    additionalAccessFilterValues: additionalAccess.length > 0
      ? additionalAccess.map(({ id }) => id)
      : [NO_ADDITIONAL_ACCESS_FILTER_VALUE],
    additionalAccessSortValue: additionalAccessLabel,
    displayRole,
    status: user.status,
    statusLabel: user.status === "active" ? "Active" : "Suspended",
    detailRoute: `/admin/people-access/users/${user.id}`,
    searchValues: [fullName, user.email, displayRole.label],
  };
}

export function createBankUserPresentations(
  users: readonly UserPresentationSource[],
  roles: readonly RolePresentationSource[],
  additionalAccess: readonly AdditionalAccessPresentationSource[],
): BankUserPresentation[] {
  return users.map((user) => createBankUserPresentation(user, roles, additionalAccess));
}
