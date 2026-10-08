import {
  getUserById,
  getUsers,
  getUsersWithPermission,
  type PermissionKey,
  type Role,
  type User,
} from "@johnshandux/ledger-synthetic-finance";

import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "./environment";

export const BANK_DEMO_USER_ID = "user-amelia-hart";

export function getBankUsers(): User[] {
  return getUsers(bankFinanceEnvironment, { businessId: BANK_BUSINESS_ID });
}

export function getBankUserById(userId: string): User | undefined {
  return getUserById(bankFinanceEnvironment, userId);
}

export function getBankUsersWithPermission(permission: PermissionKey): User[] {
  return getUsersWithPermission(bankFinanceEnvironment, permission)
    .filter(({ businessId }) => businessId === BANK_BUSINESS_ID);
}

export function getBankDemoUser(): User {
  const user = getBankUserById(BANK_DEMO_USER_ID);
  if (!user) throw new Error("The configured Ledger Bank demo user does not exist.");
  return user;
}

export function getBankRolesForUser(userId: string): Role[] {
  const user = getBankUserById(userId);
  if (!user) return [];
  const roleIds = new Set(user.roleIds);
  return bankFinanceEnvironment.roles.filter(({ id }) => roleIds.has(id));
}
