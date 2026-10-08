import type { Permission } from "../../domain/index.js";

export const caldermerePermissions = [
  { id: "permission-accounts-view", key: "accounts:view" },
  { id: "permission-transactions-view", key: "transactions:view" },
  { id: "permission-payments-create", key: "payments:create" },
  { id: "permission-payments-approve", key: "payments:approve" },
  { id: "permission-beneficiaries-view", key: "beneficiaries:view" },
  { id: "permission-beneficiaries-manage", key: "beneficiaries:manage" },
  { id: "permission-administration-view", key: "administration:view" },
  { id: "permission-administration-manage", key: "administration:manage" },
] satisfies Permission[];
