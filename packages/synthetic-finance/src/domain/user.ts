import type { BusinessId, RoleId, UserId } from "./ids.js";

export type UserStatus = "active" | "suspended";

export interface User {
  id: UserId;
  businessId: BusinessId;
  firstName: string;
  lastName: string;
  email: string;
  roleIds: RoleId[];
  status: UserStatus;
}
