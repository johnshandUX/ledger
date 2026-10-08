import type {
  BusinessId,
  PermissionKey,
  RoleId,
  User,
  UserId,
  UserStatus,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface UserQueryOptions {
  businessId?: BusinessId;
  status?: UserStatus;
  roleId?: RoleId;
}

/** Returns matching users in their stable dataset order. */
export function getUsers(
  dataset: FinanceDataset,
  options: UserQueryOptions = {},
): User[] {
  return dataset.users.filter(
    (user) =>
      (options.businessId === undefined || user.businessId === options.businessId) &&
      (options.status === undefined || user.status === options.status) &&
      (options.roleId === undefined || user.roleIds.includes(options.roleId)),
  );
}

export function getUserById(
  dataset: FinanceDataset,
  userId: UserId,
): User | undefined {
  return dataset.users.find(({ id }) => id === userId);
}

export function getUsersWithPermission(
  dataset: FinanceDataset,
  permissionKey: PermissionKey,
): User[] {
  const permissionIds = new Set(
    dataset.permissions
      .filter(({ key }) => key === permissionKey)
      .map(({ id }) => id),
  );
  const permittedRoleIds = new Set(
    dataset.roles
      .filter((role) => role.permissionIds.some((id) => permissionIds.has(id)))
      .map(({ id }) => id),
  );

  return dataset.users.filter((user) =>
    user.roleIds.some((roleId) => permittedRoleIds.has(roleId)),
  );
}
