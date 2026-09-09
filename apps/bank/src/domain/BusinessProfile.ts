import { Permission } from "./Permission";
import { BusinessRole } from "./BusinessRole";

export interface BusinessProfile {
  id: string;
  userId: string;
  businessId: string;
  role: BusinessRole;
  jobTitle?: string;
  permissions: Permission[];
}

export default BusinessProfile;
