import type { IsoDateTime } from "../../domain/index.js";
import {
  createSeededRandom,
  generateCounterpartiesAndBeneficiaries,
  generateInvoices,
  generatePayments,
  generateTransactions,
  type GenerationContext,
} from "../../generators/index.js";
import { getUtcCalendarDate } from "../../internal/date.js";
import type { FinanceDataset } from "../../validation/index.js";
import { CALDERMERE_AS_OF, CALDERMERE_BUSINESS_ID } from "./shared.js";

export const CALDERMERE_DEFAULT_SEED = 1042;

export interface CreateCaldermereDatasetOptions {
  seed?: number;
  asOf?: IsoDateTime;
}

export function createCaldermereDatasetFromAnchor(
  anchorDataset: FinanceDataset,
  options: CreateCaldermereDatasetOptions = {},
): FinanceDataset {
  const seed = options.seed ?? CALDERMERE_DEFAULT_SEED;
  const asOf = options.asOf ?? CALDERMERE_AS_OF;
  const context: GenerationContext = {
    asOf,
    asOfDate: getUtcCalendarDate(asOf),
    random: createSeededRandom(seed),
  };
  const anchor = cloneFinanceDataset(anchorDataset);
  const generatedParties = generateCounterpartiesAndBeneficiaries(
    context,
    CALDERMERE_BUSINESS_ID,
  );
  const counterparties = [
    ...anchor.counterparties,
    ...generatedParties.counterparties,
  ];
  const beneficiaries = [
    ...anchor.beneficiaries,
    ...generatedParties.beneficiaries,
  ];
  const generatedPayments = generatePayments(
    context,
    CALDERMERE_BUSINESS_ID,
    beneficiaries,
  );

  return {
    ...anchor,
    counterparties,
    beneficiaries,
    payments: [...anchor.payments, ...generatedPayments.payments],
    paymentApprovals: [
      ...anchor.paymentApprovals,
      ...generatedPayments.approvals,
    ],
    invoices: [
      ...anchor.invoices,
      ...generateInvoices(context, CALDERMERE_BUSINESS_ID, counterparties),
    ],
    transactions: [
      ...anchor.transactions,
      ...generateTransactions(
        context,
        counterparties,
        generatedPayments.payments,
      ),
    ],
  };
}

function cloneFinanceDataset(dataset: FinanceDataset): FinanceDataset {
  return {
    businesses: dataset.businesses.map((business) => ({
      ...business,
      legalEntityIds: [...business.legalEntityIds],
    })),
    legalEntities: dataset.legalEntities.map((entity) => ({ ...entity })),
    users: dataset.users.map((user) => ({ ...user, roleIds: [...user.roleIds] })),
    roles: dataset.roles.map((role) => ({
      ...role,
      permissionIds: [...role.permissionIds],
    })),
    permissions: dataset.permissions.map((permission) => ({ ...permission })),
    accounts: dataset.accounts.map((account) => ({ ...account })),
    balances: dataset.balances.map((balance) => ({ ...balance })),
    transactions: dataset.transactions.map((transaction) => ({ ...transaction })),
    counterparties: dataset.counterparties.map((counterparty) => ({
      ...counterparty,
      roles: [...counterparty.roles],
    })),
    beneficiaries: dataset.beneficiaries.map((beneficiary) => ({ ...beneficiary })),
    payments: dataset.payments.map((payment) => ({ ...payment })),
    paymentApprovals: dataset.paymentApprovals.map((approval) => ({ ...approval })),
    invoices: dataset.invoices.map((invoice) => ({ ...invoice })),
  };
}
