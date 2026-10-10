import type {
  Account,
  BalanceSnapshot,
  Beneficiary,
  Business,
  Counterparty,
  Invoice,
  LegalEntity,
  Payment,
  PaymentApproval,
  Permission,
  Role,
  Transaction,
  User,
} from "../domain/index.js";
import { additionalAccessCatalogue } from "../domain/index.js";

export interface FinanceDataset {
  businesses: Business[];
  legalEntities: LegalEntity[];
  users: User[];
  roles: Role[];
  permissions: Permission[];
  accounts: Account[];
  balances: BalanceSnapshot[];
  transactions: Transaction[];
  counterparties: Counterparty[];
  beneficiaries: Beneficiary[];
  payments: Payment[];
  paymentApprovals: PaymentApproval[];
  invoices: Invoice[];
}

export interface FinanceDatasetValidationError {
  path: string;
  message: string;
}

export type FinanceDatasetValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: FinanceDatasetValidationError[] };

export function validateFinanceDataset(
  dataset: FinanceDataset,
): FinanceDatasetValidationResult {
  const errors: FinanceDatasetValidationError[] = [];

  const validateUniqueIds = (
    collectionName: keyof FinanceDataset,
    items: ReadonlyArray<{ id: string }>,
  ) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.id)) {
        errors.push({
          path: `${collectionName}[${index}].id`,
          message: `Duplicate id "${item.id}" in ${collectionName}.`,
        });
      }
      seen.add(item.id);
    });
  };

  (Object.keys(dataset) as Array<keyof FinanceDataset>).forEach((collectionName) => {
    validateUniqueIds(collectionName, dataset[collectionName]);
  });

  const businesses = new Map(dataset.businesses.map((item) => [item.id, item]));
  const legalEntities = new Map(dataset.legalEntities.map((item) => [item.id, item]));
  const users = new Map(dataset.users.map((item) => [item.id, item]));
  const roles = new Map(dataset.roles.map((item) => [item.id, item]));
  const permissions = new Set(dataset.permissions.map((item) => item.id));
  const additionalAccessIds = new Set(
    additionalAccessCatalogue.map(({ id }) => id as string),
  );
  const accounts = new Map(dataset.accounts.map((item) => [item.id, item]));
  const counterparties = new Map(dataset.counterparties.map((item) => [item.id, item]));
  const beneficiaries = new Map(dataset.beneficiaries.map((item) => [item.id, item]));
  const payments = new Map(dataset.payments.map((item) => [item.id, item]));

  const requireReference = (
    path: string,
    entityName: string,
    id: string,
    exists: boolean,
  ) => {
    if (!exists) {
      errors.push({ path, message: `${entityName} "${id}" does not exist.` });
    }
  };

  const requireMinorUnitInteger = (path: string, value: number) => {
    if (!Number.isSafeInteger(value)) {
      errors.push({
        path,
        message: `Monetary value must be a safe integer in minor units; received ${value}.`,
      });
    }
  };

  dataset.businesses.forEach((business, index) => {
    business.legalEntityIds.forEach((legalEntityId, legalEntityIndex) => {
      const legalEntity = legalEntities.get(legalEntityId);
      const path = `businesses[${index}].legalEntityIds[${legalEntityIndex}]`;
      requireReference(path, "LegalEntity", legalEntityId, Boolean(legalEntity));
      if (legalEntity && legalEntity.businessId !== business.id) {
        errors.push({
          path,
          message: `LegalEntity "${legalEntityId}" belongs to Business "${legalEntity.businessId}", not "${business.id}".`,
        });
      }
    });
  });

  dataset.legalEntities.forEach((legalEntity, index) => {
    requireReference(
      `legalEntities[${index}].businessId`,
      "Business",
      legalEntity.businessId,
      businesses.has(legalEntity.businessId),
    );
    const business = businesses.get(legalEntity.businessId);
    if (business && !business.legalEntityIds.includes(legalEntity.id)) {
      errors.push({
        path: `legalEntities[${index}].id`,
        message: `LegalEntity "${legalEntity.id}" is not listed by Business "${legalEntity.businessId}".`,
      });
    }
  });

  dataset.roles.forEach((role, index) => {
    requireReference(
      `roles[${index}].businessId`,
      "Business",
      role.businessId,
      businesses.has(role.businessId),
    );
    role.permissionIds.forEach((permissionId, permissionIndex) => {
      requireReference(
        `roles[${index}].permissionIds[${permissionIndex}]`,
        "Permission",
        permissionId,
        permissions.has(permissionId),
      );
    });
  });

  dataset.users.forEach((user, index) => {
    requireReference(
      `users[${index}].businessId`,
      "Business",
      user.businessId,
      businesses.has(user.businessId),
    );
    if (user.roleIds.length > 1) {
      errors.push({
        path: `users[${index}].roleIds`,
        message: "User must have zero or one banking role.",
      });
    }
    user.roleIds.forEach((roleId, roleIndex) => {
      const role = roles.get(roleId);
      const path = `users[${index}].roleIds[${roleIndex}]`;
      requireReference(path, "Role", roleId, Boolean(role));
      if (role && role.businessId !== user.businessId) {
        errors.push({
          path,
          message: `Role "${roleId}" belongs to Business "${role.businessId}", not "${user.businessId}".`,
        });
      }
    });
    const seenAdditionalAccessIds = new Set<string>();
    user.additionalAccessIds.forEach((additionalAccessId, accessIndex) => {
      const path = `users[${index}].additionalAccessIds[${accessIndex}]`;
      requireReference(
        path,
        "Additional access",
        additionalAccessId,
        additionalAccessIds.has(additionalAccessId),
      );
      if (seenAdditionalAccessIds.has(additionalAccessId)) {
        errors.push({
          path,
          message: `Duplicate additional access id "${additionalAccessId}".`,
        });
      }
      seenAdditionalAccessIds.add(additionalAccessId);
    });
  });

  dataset.accounts.forEach((account, index) => {
    requireReference(
      `accounts[${index}].businessId`,
      "Business",
      account.businessId,
      businesses.has(account.businessId),
    );
    const legalEntity = legalEntities.get(account.legalEntityId);
    const path = `accounts[${index}].legalEntityId`;
    requireReference(path, "LegalEntity", account.legalEntityId, Boolean(legalEntity));
    if (legalEntity && legalEntity.businessId !== account.businessId) {
      errors.push({
        path,
        message: `LegalEntity "${account.legalEntityId}" belongs to Business "${legalEntity.businessId}", not "${account.businessId}".`,
      });
    }
  });

  dataset.balances.forEach((balance, index) => {
    const account = accounts.get(balance.accountId);
    requireReference(
      `balances[${index}].accountId`,
      "Account",
      balance.accountId,
      accounts.has(balance.accountId),
    );
    requireMinorUnitInteger(
      `balances[${index}].ledgerBalanceMinor`,
      balance.ledgerBalanceMinor,
    );
    requireMinorUnitInteger(
      `balances[${index}].availableBalanceMinor`,
      balance.availableBalanceMinor,
    );
    if (account && balance.currency !== account.currency) {
      errors.push({
        path: `balances[${index}].currency`,
        message: `Balance currency "${balance.currency}" does not match Account "${account.id}" currency "${account.currency}".`,
      });
    }
  });

  dataset.transactions.forEach((transaction, index) => {
    const account = accounts.get(transaction.accountId);
    requireReference(
      `transactions[${index}].accountId`,
      "Account",
      transaction.accountId,
      accounts.has(transaction.accountId),
    );
    requireMinorUnitInteger(
      `transactions[${index}].amountMinor`,
      transaction.amountMinor,
    );
    if (account && transaction.currency !== account.currency) {
      errors.push({
        path: `transactions[${index}].currency`,
        message: `Transaction currency "${transaction.currency}" does not match Account "${account.id}" currency "${account.currency}".`,
      });
    }
    if (transaction.counterpartyId !== undefined) {
      const counterparty = counterparties.get(transaction.counterpartyId);
      requireReference(
        `transactions[${index}].counterpartyId`,
        "Counterparty",
        transaction.counterpartyId,
        counterparties.has(transaction.counterpartyId),
      );
      if (account && counterparty && counterparty.businessId !== account.businessId) {
        errors.push({
          path: `transactions[${index}].counterpartyId`,
          message: `Counterparty "${counterparty.id}" belongs to Business "${counterparty.businessId}", not "${account.businessId}".`,
        });
      }
    }
    if (transaction.paymentId !== undefined) {
      const payment = payments.get(transaction.paymentId);
      requireReference(
        `transactions[${index}].paymentId`,
        "Payment",
        transaction.paymentId,
        payments.has(transaction.paymentId),
      );
      if (account && payment && payment.businessId !== account.businessId) {
        errors.push({
          path: `transactions[${index}].paymentId`,
          message: `Payment "${payment.id}" belongs to Business "${payment.businessId}", not "${account.businessId}".`,
        });
      }
    }
  });

  dataset.counterparties.forEach((counterparty, index) => {
    requireReference(
      `counterparties[${index}].businessId`,
      "Business",
      counterparty.businessId,
      businesses.has(counterparty.businessId),
    );
  });

  dataset.beneficiaries.forEach((beneficiary, index) => {
    requireReference(
      `beneficiaries[${index}].businessId`,
      "Business",
      beneficiary.businessId,
      businesses.has(beneficiary.businessId),
    );
    if (beneficiary.counterpartyId !== undefined) {
      const counterparty = counterparties.get(beneficiary.counterpartyId);
      requireReference(
        `beneficiaries[${index}].counterpartyId`,
        "Counterparty",
        beneficiary.counterpartyId,
        counterparties.has(beneficiary.counterpartyId),
      );
      if (counterparty && counterparty.businessId !== beneficiary.businessId) {
        errors.push({
          path: `beneficiaries[${index}].counterpartyId`,
          message: `Counterparty "${counterparty.id}" belongs to Business "${counterparty.businessId}", not "${beneficiary.businessId}".`,
        });
      }
    }
  });

  dataset.payments.forEach((payment, index) => {
    const account = accounts.get(payment.sourceAccountId);
    requireReference(
      `payments[${index}].businessId`,
      "Business",
      payment.businessId,
      businesses.has(payment.businessId),
    );
    requireMinorUnitInteger(`payments[${index}].amountMinor`, payment.amountMinor);
    requireReference(
      `payments[${index}].sourceAccountId`,
      "Account",
      payment.sourceAccountId,
      accounts.has(payment.sourceAccountId),
    );
    if (account && account.businessId !== payment.businessId) {
      errors.push({
        path: `payments[${index}].sourceAccountId`,
        message: `Account "${account.id}" belongs to Business "${account.businessId}", not "${payment.businessId}".`,
      });
    }
    if (account && payment.currency !== account.currency) {
      errors.push({
        path: `payments[${index}].currency`,
        message: `Payment currency "${payment.currency}" does not match Account "${account.id}" currency "${account.currency}".`,
      });
    }
    const beneficiary = beneficiaries.get(payment.beneficiaryId);
    requireReference(
      `payments[${index}].beneficiaryId`,
      "Beneficiary",
      payment.beneficiaryId,
      beneficiaries.has(payment.beneficiaryId),
    );
    if (beneficiary && beneficiary.businessId !== payment.businessId) {
      errors.push({
        path: `payments[${index}].beneficiaryId`,
        message: `Beneficiary "${beneficiary.id}" belongs to Business "${beneficiary.businessId}", not "${payment.businessId}".`,
      });
    }
    if (beneficiary && payment.currency !== beneficiary.currency) {
      errors.push({
        path: `payments[${index}].currency`,
        message: `Payment currency "${payment.currency}" does not match Beneficiary "${beneficiary.id}" currency "${beneficiary.currency}".`,
      });
    }
    const creator = users.get(payment.createdByUserId);
    requireReference(
      `payments[${index}].createdByUserId`,
      "User",
      payment.createdByUserId,
      users.has(payment.createdByUserId),
    );
    if (creator && creator.businessId !== payment.businessId) {
      errors.push({
        path: `payments[${index}].createdByUserId`,
        message: `User "${creator.id}" belongs to Business "${creator.businessId}", not "${payment.businessId}".`,
      });
    }
  });

  dataset.paymentApprovals.forEach((approval, index) => {
    const payment = payments.get(approval.paymentId);
    const approver = users.get(approval.approverUserId);
    requireReference(
      `paymentApprovals[${index}].paymentId`,
      "Payment",
      approval.paymentId,
      payments.has(approval.paymentId),
    );
    requireReference(
      `paymentApprovals[${index}].approverUserId`,
      "User",
      approval.approverUserId,
      users.has(approval.approverUserId),
    );
    if (payment && approver && approver.businessId !== payment.businessId) {
      errors.push({
        path: `paymentApprovals[${index}].approverUserId`,
        message: `User "${approver.id}" belongs to Business "${approver.businessId}", not "${payment.businessId}".`,
      });
    }
  });

  dataset.invoices.forEach((invoice, index) => {
    const counterparty = counterparties.get(invoice.counterpartyId);
    requireReference(
      `invoices[${index}].businessId`,
      "Business",
      invoice.businessId,
      businesses.has(invoice.businessId),
    );
    requireMinorUnitInteger(`invoices[${index}].amountMinor`, invoice.amountMinor);
    requireMinorUnitInteger(
      `invoices[${index}].outstandingAmountMinor`,
      invoice.outstandingAmountMinor,
    );
    requireReference(
      `invoices[${index}].counterpartyId`,
      "Counterparty",
      invoice.counterpartyId,
      counterparties.has(invoice.counterpartyId),
    );
    if (counterparty && counterparty.businessId !== invoice.businessId) {
      errors.push({
        path: `invoices[${index}].counterpartyId`,
        message: `Counterparty "${counterparty.id}" belongs to Business "${counterparty.businessId}", not "${invoice.businessId}".`,
      });
    }
  });

  return errors.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors };
}
