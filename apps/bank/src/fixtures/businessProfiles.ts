import { BusinessProfile } from "../domain/BusinessProfile";

export const businessProfiles: BusinessProfile[] = [
  // Alex @ Northstar - Finance Director (admin)
  {
    id: "bp-alex-northstar",
    userId: "u-alex",
    businessId: "b-northstar",
    role: "administrator",
    jobTitle: "Finance Director",
    permissions: ["accounts:view", "accounts:transactions:view", "payments:create", "payments:approve"],
  },
  // Alex @ Morgan - Director (view-only)
  {
    id: "bp-alex-morgan",
    userId: "u-alex",
    businessId: "b-morgan",
    role: "viewer",
    jobTitle: "Director",
    permissions: ["accounts:view", "accounts:transactions:view"],
  },
  // Priya @ Northstar - Accounts Manager (payment-creation)
  {
    id: "bp-priya-northstar",
    userId: "u-priya",
    businessId: "b-northstar",
    role: "payment-creator",
    jobTitle: "Accounts Manager",
    permissions: ["accounts:view", "accounts:transactions:view", "payments:create"],
  },
  // Alex @ Northstar - audit role can inspect account metadata but not transactions
  {
    id: "bp-auditor-northstar",
    userId: "u-alex",
    businessId: "b-northstar",
    role: "viewer",
    jobTitle: "External Auditor",
    permissions: ["accounts:view"],
  },
];

export default businessProfiles;
