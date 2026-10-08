import type { BusinessId, PermissionId, RoleId } from "./ids.js";

export type PermissionKey =
  | "accounts:view"
  | "transactions:view"
  | "payments:create"
  | "payments:approve"
  | "beneficiaries:view"
  | "beneficiaries:manage"
  | "administration:view"
  | "administration:manage";

export interface Permission {
  id: PermissionId;
  key: PermissionKey;
}

export interface Role {
  id: RoleId;
  businessId: BusinessId;
  name: string;
  permissionIds: PermissionId[];
}
