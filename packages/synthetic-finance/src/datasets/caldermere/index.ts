import type { FinanceDataset } from "../../validation/index.js";
import {
  createCaldermereDatasetFromAnchor,
  CALDERMERE_DEFAULT_SEED,
  type CreateCaldermereDatasetOptions,
} from "./create-dataset.js";
import { caldermereAccounts } from "./accounts.js";
import { caldermereBalances } from "./balances.js";
import { caldermereBeneficiaries } from "./beneficiaries.js";
import { caldermereBusinesses } from "./business.js";
import { caldermereCounterparties } from "./counterparties.js";
import { caldermereInvoices } from "./invoices.js";
import { caldermereLegalEntities } from "./legal-entity.js";
import { caldermerePaymentApprovals } from "./payment-approvals.js";
import { caldermerePayments } from "./payments.js";
import { caldermerePermissions } from "./permissions.js";
import { caldermereRoles } from "./roles.js";
import { caldermereTransactions } from "./transactions.js";
import { caldermereUsers } from "./users.js";

export { CALDERMERE_AS_OF } from "./shared.js";

export const caldermereDataset: FinanceDataset = {
  businesses: caldermereBusinesses,
  legalEntities: caldermereLegalEntities,
  users: caldermereUsers,
  roles: caldermereRoles,
  permissions: caldermerePermissions,
  accounts: caldermereAccounts,
  balances: caldermereBalances,
  transactions: caldermereTransactions,
  counterparties: caldermereCounterparties,
  beneficiaries: caldermereBeneficiaries,
  payments: caldermerePayments,
  paymentApprovals: caldermerePaymentApprovals,
  invoices: caldermereInvoices,
};

export { CALDERMERE_DEFAULT_SEED, type CreateCaldermereDatasetOptions };

export function createCaldermereDataset(
  options: CreateCaldermereDatasetOptions = {},
): FinanceDataset {
  return createCaldermereDatasetFromAnchor(caldermereDataset, options);
}
