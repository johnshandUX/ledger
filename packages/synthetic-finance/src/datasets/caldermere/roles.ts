import type { Role } from "../../domain/index.js";
import { CALDERMERE_BUSINESS_ID } from "./shared.js";

export const caldermereRoles = [
  {
    id: "role-finance-leadership",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Finance Leadership",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-payments-create",
      "permission-payments-approve",
      "permission-beneficiaries-view",
      "permission-beneficiaries-manage",
      "permission-administration-view",
    ],
  },
  {
    id: "role-treasury",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Treasury",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-payments-create",
      "permission-payments-approve",
      "permission-beneficiaries-view",
    ],
  },
  {
    id: "role-payables",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Accounts Payable",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-payments-create",
      "permission-beneficiaries-view",
      "permission-beneficiaries-manage",
    ],
  },
  {
    id: "role-receivables",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Accounts Receivable",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-beneficiaries-view",
    ],
  },
  {
    id: "role-business-administration",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Business Administration",
    permissionIds: [
      "permission-administration-view",
      "permission-administration-manage",
      "permission-accounts-view",
    ],
  },
  {
    id: "role-read-only",
    businessId: CALDERMERE_BUSINESS_ID,
    name: "Viewer / Auditor",
    permissionIds: [
      "permission-accounts-view",
      "permission-transactions-view",
      "permission-beneficiaries-view",
      "permission-administration-view",
    ],
  },
] satisfies Role[];
