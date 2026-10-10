import type { Role } from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

export const caldermereRoles = [
  {
    id: "role-administrator",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Administrator",
    description: "Full banking and administrative access.",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-payments-create",
      "permission-payments-approve",
      "permission-beneficiaries-view",
      "permission-beneficiaries-manage",
      "permission-administration-view",
      "permission-administration-manage",
    ],
  },
  {
    id: "role-payment-operator",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Payment operator",
    description: "Creates and manages payments.",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-payments-create",
      "permission-beneficiaries-view",
      "permission-beneficiaries-manage",
    ],
  },
  {
    id: "role-payment-approver",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Payment approver",
    description: "Reviews and authorises payments.",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-payments-approve",
      "permission-beneficiaries-view",
    ],
  },
  {
    id: "role-viewer",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Viewer",
    description: "Views financial information.",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-beneficiaries-view",
    ],
  },
] satisfies Role[];
