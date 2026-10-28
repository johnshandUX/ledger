import type {
  Account,
  BalanceSnapshot,
  Beneficiary,
  Business,
  Counterparty,
  CardSpendingLimit,
  CardTransaction,
  ExpenseCard,
  ExpenseCardholder,
  ExpenseRecord,
  ExpenseTeam,
  Invoice,
  LegalEntity,
  Merchant,
  Payment,
  PaymentApproval,
  Permission,
  Role,
  Transaction,
  TeamSpendingBudget,
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
  expenseTeams: ExpenseTeam[];
  teamSpendingBudgets: TeamSpendingBudget[];
  expenseCardholders: ExpenseCardholder[];
  expenseCards: ExpenseCard[];
  cardSpendingLimits: CardSpendingLimit[];
  merchants: Merchant[];
  cardTransactions: CardTransaction[];
  expenseRecords: ExpenseRecord[];
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
  const expenseTeams = new Map(dataset.expenseTeams.map((item) => [item.id, item]));
  const expenseCardholders = new Map(dataset.expenseCardholders.map((item) => [item.id, item]));
  const expenseCards = new Map(dataset.expenseCards.map((item) => [item.id, item]));
  const merchants = new Map(dataset.merchants.map((item) => [item.id, item]));
  const cardTransactions = new Map(dataset.cardTransactions.map((item) => [item.id, item]));

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

  dataset.expenseTeams.forEach((team, index) => {
    requireReference(
      `expenseTeams[${index}].businessId`,
      "Business",
      team.businessId,
      businesses.has(team.businessId),
    );
  });

  dataset.teamSpendingBudgets.forEach((budget, index) => {
    requireReference(
      `teamSpendingBudgets[${index}].teamId`,
      "ExpenseTeam",
      budget.teamId,
      expenseTeams.has(budget.teamId),
    );
    requireMinorUnitInteger(`teamSpendingBudgets[${index}].amountMinor`, budget.amountMinor);
    if (budget.amountMinor <= 0) {
      errors.push({ path: `teamSpendingBudgets[${index}].amountMinor`, message: "Budget amount must be positive." });
    }
  });

  dataset.expenseCardholders.forEach((cardholder, index) => {
    requireReference(
      `expenseCardholders[${index}].businessId`,
      "Business",
      cardholder.businessId,
      businesses.has(cardholder.businessId),
    );
    const team = expenseTeams.get(cardholder.primaryTeamId);
    requireReference(
      `expenseCardholders[${index}].primaryTeamId`,
      "ExpenseTeam",
      cardholder.primaryTeamId,
      Boolean(team),
    );
    if (team && team.businessId !== cardholder.businessId) {
      errors.push({ path: `expenseCardholders[${index}].primaryTeamId`, message: `ExpenseTeam "${team.id}" belongs to Business "${team.businessId}", not "${cardholder.businessId}".` });
    }
    if (cardholder.userId !== undefined) {
      const user = users.get(cardholder.userId);
      requireReference(`expenseCardholders[${index}].userId`, "User", cardholder.userId, Boolean(user));
      if (user && user.businessId !== cardholder.businessId) {
        errors.push({ path: `expenseCardholders[${index}].userId`, message: `User "${user.id}" belongs to Business "${user.businessId}", not "${cardholder.businessId}".` });
      }
    }
  });

  dataset.expenseCards.forEach((card, index) => {
    const cardholder = expenseCardholders.get(card.cardholderId);
    const team = expenseTeams.get(card.spendingTeamId);
    requireReference(`expenseCards[${index}].businessId`, "Business", card.businessId, businesses.has(card.businessId));
    requireReference(`expenseCards[${index}].cardholderId`, "ExpenseCardholder", card.cardholderId, Boolean(cardholder));
    requireReference(`expenseCards[${index}].spendingTeamId`, "ExpenseTeam", card.spendingTeamId, Boolean(team));
    if (cardholder && cardholder.businessId !== card.businessId) {
      errors.push({ path: `expenseCards[${index}].cardholderId`, message: `ExpenseCardholder "${cardholder.id}" belongs to Business "${cardholder.businessId}", not "${card.businessId}".` });
    }
    if (team && team.businessId !== card.businessId) {
      errors.push({ path: `expenseCards[${index}].spendingTeamId`, message: `ExpenseTeam "${team.id}" belongs to Business "${team.businessId}", not "${card.businessId}".` });
    }
    if (!/^\d{4}$/.test(card.lastFour)) {
      errors.push({ path: `expenseCards[${index}].lastFour`, message: "Card lastFour must contain exactly four digits." });
    }
  });

  const limitCountByCard = new Map<string, number>();
  dataset.cardSpendingLimits.forEach((limit, index) => {
    requireReference(`cardSpendingLimits[${index}].cardId`, "ExpenseCard", limit.cardId, expenseCards.has(limit.cardId));
    requireMinorUnitInteger(`cardSpendingLimits[${index}].amountMinor`, limit.amountMinor);
    if (limit.amountMinor <= 0) {
      errors.push({ path: `cardSpendingLimits[${index}].amountMinor`, message: "Card limit amount must be positive." });
    }
    limitCountByCard.set(limit.cardId, (limitCountByCard.get(limit.cardId) ?? 0) + 1);
  });
  dataset.expenseCards.forEach((card, index) => {
    if (limitCountByCard.get(card.id) !== 1) {
      errors.push({ path: `expenseCards[${index}].id`, message: `ExpenseCard "${card.id}" must have exactly one primary spending limit.` });
    }
  });

  dataset.cardTransactions.forEach((transaction, index) => {
    const card = expenseCards.get(transaction.cardId);
    const cardholder = expenseCardholders.get(transaction.cardholderId);
    const team = expenseTeams.get(transaction.spendingTeamId);
    requireReference(`cardTransactions[${index}].cardId`, "ExpenseCard", transaction.cardId, Boolean(card));
    requireReference(`cardTransactions[${index}].cardholderId`, "ExpenseCardholder", transaction.cardholderId, Boolean(cardholder));
    requireReference(`cardTransactions[${index}].spendingTeamId`, "ExpenseTeam", transaction.spendingTeamId, Boolean(team));
    requireReference(`cardTransactions[${index}].merchantId`, "Merchant", transaction.merchantId, merchants.has(transaction.merchantId));
    requireMinorUnitInteger(`cardTransactions[${index}].amountMinor`, transaction.amountMinor);
    if (transaction.amountMinor <= 0) {
      errors.push({ path: `cardTransactions[${index}].amountMinor`, message: "Card transaction amount must be positive; transaction type represents refunds." });
    }
    if (card && card.cardholderId !== transaction.cardholderId) {
      errors.push({ path: `cardTransactions[${index}].cardholderId`, message: `Card transaction cardholder does not match ExpenseCard "${card.id}".` });
    }
    const transactionDate = transaction.transactedAt.slice(0, 10);
    if (card && (transaction.status === "settled" || transaction.status === "pending")) {
      if (card.status === "pending_activation" || card.activatedAt === undefined) {
        errors.push({ path: `cardTransactions[${index}].cardId`, message: `Successful CardTransaction cannot use unactivated ExpenseCard "${card.id}".` });
      }
      if (transactionDate < card.issuedAt) {
        errors.push({ path: `cardTransactions[${index}].transactedAt`, message: `Successful CardTransaction predates ExpenseCard "${card.id}" issuance.` });
      }
      if (card.activatedAt !== undefined && transactionDate < card.activatedAt) {
        errors.push({ path: `cardTransactions[${index}].transactedAt`, message: `Successful CardTransaction predates ExpenseCard "${card.id}" activation.` });
      }
      if (card.validFrom !== undefined && transactionDate < card.validFrom) {
        errors.push({ path: `cardTransactions[${index}].transactedAt`, message: `Successful CardTransaction predates ExpenseCard "${card.id}" validity period.` });
      }
      if (card.validTo !== undefined && transactionDate > card.validTo) {
        errors.push({ path: `cardTransactions[${index}].transactedAt`, message: `Successful CardTransaction is after ExpenseCard "${card.id}" validity period.` });
      }
      if (card.expiresAt !== undefined && transactionDate > card.expiresAt) {
        errors.push({ path: `cardTransactions[${index}].transactedAt`, message: `Successful CardTransaction is after ExpenseCard "${card.id}" expiry.` });
      }
    }
    if (transaction.status === "settled" && transaction.settledAt === undefined) {
      errors.push({ path: `cardTransactions[${index}].settledAt`, message: "Settled CardTransaction requires settledAt." });
    }
    if (transaction.settledAt !== undefined && transaction.settledAt < transaction.transactedAt) {
      errors.push({ path: `cardTransactions[${index}].settledAt`, message: "CardTransaction cannot settle before it was transacted." });
    }
    if (cardholder && team && cardholder.businessId !== team.businessId) {
      errors.push({ path: `cardTransactions[${index}].spendingTeamId`, message: "Card transaction cardholder and spending team belong to different businesses." });
    }
    const limit = dataset.cardSpendingLimits.find(({ cardId }) => cardId === transaction.cardId);
    if (limit && transaction.currency !== limit.currency) {
      errors.push({ path: `cardTransactions[${index}].currency`, message: `Card transaction currency "${transaction.currency}" does not match CardSpendingLimit currency "${limit.currency}".` });
    }
    if (limit?.type === "per_transaction" && transaction.status === "settled" && transaction.type === "purchase" && transaction.amountMinor > limit.amountMinor) {
      errors.push({ path: `cardTransactions[${index}].amountMinor`, message: `Settled purchase exceeds per-transaction limit for ExpenseCard "${transaction.cardId}".` });
    }
  });

  const transactionIndexById = new Map(
    dataset.cardTransactions.map((transaction, index) => [transaction.id, index]),
  );
  dataset.cardSpendingLimits.forEach((limit) => {
    if (limit.type === "per_transaction") return;
    const runningByPeriod = new Map<string, number>();
    const transactions = dataset.cardTransactions
      .filter(
        (transaction) =>
          transaction.cardId === limit.cardId &&
          transaction.currency === limit.currency &&
          transaction.status === "settled",
      )
      .sort((left, right) => left.transactedAt.localeCompare(right.transactedAt));
    for (const transaction of transactions) {
      const periodKey = limit.type === "monthly"
        ? transaction.transactedAt.slice(0, 7)
        : "lifetime";
      const running = runningByPeriod.get(periodKey) ?? 0;
      if (transaction.type === "purchase") {
        if (running + transaction.amountMinor > limit.amountMinor) {
          const index = transactionIndexById.get(transaction.id)!;
          errors.push({
            path: `cardTransactions[${index}].amountMinor`,
            message: `Settled purchase breaches ${limit.type} limit for ExpenseCard "${limit.cardId}" at the transaction time.`,
          });
        }
        runningByPeriod.set(periodKey, running + transaction.amountMinor);
      } else {
        runningByPeriod.set(periodKey, Math.max(0, running - transaction.amountMinor));
      }
    }
  });

  const recordTransactions = new Set<string>();
  dataset.expenseRecords.forEach((record, index) => {
    requireReference(`expenseRecords[${index}].cardTransactionId`, "CardTransaction", record.cardTransactionId, cardTransactions.has(record.cardTransactionId));
    if (recordTransactions.has(record.cardTransactionId)) {
      errors.push({ path: `expenseRecords[${index}].cardTransactionId`, message: `CardTransaction "${record.cardTransactionId}" has more than one ExpenseRecord.` });
    }
    recordTransactions.add(record.cardTransactionId);
  });

  return errors.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors };
}
