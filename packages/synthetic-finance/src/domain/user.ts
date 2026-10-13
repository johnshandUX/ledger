import type { BusinessId, RoleId, UserId } from "./ids.js";
import type { AdditionalAccessId } from "./additional-access.js";

export type UserStatus = "active" | "suspended";

export interface User {
  id: UserId;
  businessId: BusinessId;
  firstName: string;
  lastName: string;
  email: string;
  /** Optional business position. It does not confer banking permissions or access. */
  jobTitle?: string;
  /** Zero or one banking role. Dataset validation enforces this cardinality. */
  roleIds: RoleId[];
  additionalAccessIds: AdditionalAccessId[];
  status: UserStatus;
}
