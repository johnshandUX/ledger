import type {
  CardSpendingLimit,
  CardTransaction,
  BusinessId,
  CurrencyCode,
  ExpenseCard,
  ExpenseCardId,
  ExpenseCardStatus,
  ExpenseCardType,
  ExpenseCardholder,
  ExpenseCardholderId,
  ExpenseRecord,
  ExpenseTeam,
  ExpenseTeamId,
  IsoDate,
  Merchant,
  TeamSpendingBudget,
} from "../domain/index.js";
import type { FinanceDataset } from "../validation/index.js";

export interface ExpenseReportingPeriod {
  businessId: BusinessId;
  /** Inclusive calendar date. */
  from: IsoDate;
  /** Inclusive calendar date. */
  to: IsoDate;
  currency: CurrencyCode;
}

function belongsToBusiness(
  dataset: FinanceDataset,
  transaction: CardTransaction,
  businessId: BusinessId,
) {
  return dataset.expenseTeams.some(
    ({ id, businessId: candidate }) =>
      id === transaction.spendingTeamId && candidate === businessId,
  );
}

function inPeriod(transaction: CardTransaction, period: ExpenseReportingPeriod) {
  const date = transaction.transactedAt.slice(0, 10);
  return transaction.currency === period.currency && date >= period.from && date <= period.to;
}

function settledContribution(transaction: CardTransaction) {
  if (transaction.status !== "settled") return 0;
  return transaction.type === "refund" ? -transaction.amountMinor : transaction.amountMinor;
}

function pendingContribution(transaction: CardTransaction) {
  return transaction.status === "pending" && transaction.type === "purchase"
    ? transaction.amountMinor
    : 0;
}

export function getTotalSettledCardSpending(
  dataset: FinanceDataset,
  period: ExpenseReportingPeriod,
): number {
  return dataset.cardTransactions
    .filter(
      (transaction) =>
        belongsToBusiness(dataset, transaction, period.businessId) &&
        inPeriod(transaction, period),
    )
    .reduce((total, transaction) => total + settledContribution(transaction), 0);
}

export function getPendingCardSpending(
  dataset: FinanceDataset,
  period: ExpenseReportingPeriod,
): number {
  return dataset.cardTransactions
    .filter(
      (transaction) =>
        belongsToBusiness(dataset, transaction, period.businessId) &&
        inPeriod(transaction, period),
    )
    .reduce((total, transaction) => total + pendingContribution(transaction), 0);
}

export interface ExpenseAttentionCounts {
  missingReceipts: number;
  pendingReview: number;
  unreconciled: number;
  automaticallyMatched: number;
}

function getExpenseAttentionCountsForTransactions(
  dataset: FinanceDataset,
  transactionIds: ReadonlySet<string>,
): ExpenseAttentionCounts {
  const records = dataset.expenseRecords.filter(({ cardTransactionId }) =>
    transactionIds.has(cardTransactionId),
  );
  return {
    missingReceipts: records.filter(({ receiptStatus }) => receiptStatus === "missing").length,
    pendingReview: records.filter(({ reviewStatus }) => reviewStatus === "pending_review").length,
    unreconciled: records.filter(({ reconciliationStatus }) => reconciliationStatus === "unreconciled").length,
    automaticallyMatched: records.filter(
      ({ reconciliationStatus, matchMethod }) => reconciliationStatus === "matched" && matchMethod === "automatic",
    ).length,
  };
}

export function getExpenseAttentionCounts(dataset: FinanceDataset): ExpenseAttentionCounts {
  return getExpenseAttentionCountsForTransactions(
    dataset,
    new Set(dataset.cardTransactions.map(({ id }) => id)),
  );
}

export function getMissingReceiptCount(dataset: FinanceDataset) {
  return getExpenseAttentionCounts(dataset).missingReceipts;
}

export function getPendingReviewCount(dataset: FinanceDataset) {
  return getExpenseAttentionCounts(dataset).pendingReview;
}

export function getUnreconciledExpenseCount(dataset: FinanceDataset) {
  return getExpenseAttentionCounts(dataset).unreconciled;
}

export function getAutomaticallyMatchedExpenses(dataset: FinanceDataset): ExpenseRecord[] {
  return dataset.expenseRecords.filter(
    ({ reconciliationStatus, matchMethod }) => reconciliationStatus === "matched" && matchMethod === "automatic",
  );
}

export interface ExpenseOrganisationSummary {
  currency: CurrencyCode;
  settledSpendingMinor: number;
  pendingSpendingMinor: number;
  activeCardCount: number;
  physicalCardCount: number;
  virtualCardCount: number;
  cardholderCount: number;
  totalMonthlyTeamBudgetsMinor: number;
  attention: ExpenseAttentionCounts;
}

export function getExpenseOrganisationSummary(
  dataset: FinanceDataset,
  period: ExpenseReportingPeriod,
): ExpenseOrganisationSummary {
  const organisationTeams = dataset.expenseTeams.filter(
    ({ businessId }) => businessId === period.businessId,
  );
  const organisationTeamIds = new Set(organisationTeams.map(({ id }) => id));
  const organisationCards = dataset.expenseCards.filter(
    ({ businessId }) => businessId === period.businessId,
  );
  const currentBudgets = organisationTeams
    .map(({ id }) =>
      getTeamCurrentBudget(dataset, period.businessId, id, period.from, period.currency),
    )
    .filter((budget): budget is TeamSpendingBudget => budget !== undefined);
  return {
    currency: period.currency,
    settledSpendingMinor: getTotalSettledCardSpending(dataset, period),
    pendingSpendingMinor: getPendingCardSpending(dataset, period),
    activeCardCount: organisationCards.filter(({ status }) => status === "active").length,
    physicalCardCount: organisationCards.filter(({ type }) => type === "physical").length,
    virtualCardCount: organisationCards.filter(({ type }) => type === "virtual").length,
    cardholderCount: dataset.expenseCardholders.filter(
      ({ businessId }) => businessId === period.businessId,
    ).length,
    totalMonthlyTeamBudgetsMinor: currentBudgets.reduce((total, budget) => total + budget.amountMinor, 0),
    attention: getExpenseAttentionCountsForTransactions(
      dataset,
      new Set(
        dataset.cardTransactions
          .filter(({ spendingTeamId }) => organisationTeamIds.has(spendingTeamId))
          .map(({ id }) => id),
      ),
    ),
  };
}

export function getTeamCurrentBudget(
  dataset: FinanceDataset,
  businessId: BusinessId,
  teamId: ExpenseTeamId,
  asOf: IsoDate,
  currency: CurrencyCode,
): TeamSpendingBudget | undefined {
  if (!dataset.expenseTeams.some((team) => team.id === teamId && team.businessId === businessId)) {
    return undefined;
  }
  return dataset.teamSpendingBudgets.find(
    (budget) =>
      budget.teamId === teamId &&
      budget.currency === currency &&
      budget.effectiveFrom <= asOf &&
      (budget.effectiveTo === undefined || budget.effectiveTo >= asOf),
  );
}

export function getTeamSettledExpenditure(
  dataset: FinanceDataset,
  teamId: ExpenseTeamId,
  period: ExpenseReportingPeriod,
): number {
  if (!dataset.expenseTeams.some((team) => team.id === teamId && team.businessId === period.businessId)) {
    return 0;
  }
  return dataset.cardTransactions
    .filter((transaction) => transaction.spendingTeamId === teamId && inPeriod(transaction, period))
    .reduce((total, transaction) => total + settledContribution(transaction), 0);
}

export interface ExpenseTeamSummary {
  team: ExpenseTeam;
  budget?: TeamSpendingBudget;
  settledSpendingMinor: number;
  pendingSpendingMinor: number;
  remainingBudgetMinor?: number;
  budgetUtilisationPercentage?: number;
}

export function getExpenseTeamsWithSummaries(
  dataset: FinanceDataset,
  period: ExpenseReportingPeriod,
): ExpenseTeamSummary[] {
  return dataset.expenseTeams
    .filter(({ businessId }) => businessId === period.businessId)
    .map((team) => {
    const budget = getTeamCurrentBudget(
      dataset,
      period.businessId,
      team.id,
      period.from,
      period.currency,
    );
    const settledSpendingMinor = getTeamSettledExpenditure(dataset, team.id, period);
    const pendingSpendingMinor = dataset.cardTransactions
      .filter((transaction) => transaction.spendingTeamId === team.id && inPeriod(transaction, period))
      .reduce((total, transaction) => total + pendingContribution(transaction), 0);
    return {
      team,
      ...(budget === undefined ? {} : { budget }),
      settledSpendingMinor,
      pendingSpendingMinor,
      ...(budget === undefined
        ? {}
        : {
            remainingBudgetMinor: budget.amountMinor - settledSpendingMinor,
            budgetUtilisationPercentage: (settledSpendingMinor / budget.amountMinor) * 100,
          }),
    };
    });
}

export function getTeamBudgetUtilisation(
  dataset: FinanceDataset,
  teamId: ExpenseTeamId,
  period: ExpenseReportingPeriod,
) {
  return getExpenseTeamsWithSummaries(dataset, period).find(({ team }) => team.id === teamId);
}

export function getExpenseCardholders(
  dataset: FinanceDataset,
  options: { businessId: BusinessId; primaryTeamId?: ExpenseTeamId },
): ExpenseCardholder[] {
  return dataset.expenseCardholders.filter(
    ({ businessId, primaryTeamId }) =>
      businessId === options.businessId &&
      (options.primaryTeamId === undefined || primaryTeamId === options.primaryTeamId),
  );
}

export function getExpenseCards(
  dataset: FinanceDataset,
  options: {
    businessId: BusinessId;
    spendingTeamId?: ExpenseTeamId;
    cardholderId?: ExpenseCardholderId;
    type?: ExpenseCardType;
    status?: ExpenseCardStatus;
  },
): ExpenseCard[] {
  return dataset.expenseCards.filter(
    (card) =>
      card.businessId === options.businessId &&
      (options.spendingTeamId === undefined || card.spendingTeamId === options.spendingTeamId) &&
      (options.cardholderId === undefined || card.cardholderId === options.cardholderId) &&
      (options.type === undefined || card.type === options.type) &&
      (options.status === undefined || card.status === options.status),
  );
}

export interface ExpenseCardDetails {
  card: ExpenseCard;
  cardholder: ExpenseCardholder;
  team: ExpenseTeam;
  limit: CardSpendingLimit;
}

export function getExpenseCardById(
  dataset: FinanceDataset,
  businessId: BusinessId,
  cardId: ExpenseCardId,
): ExpenseCardDetails | undefined {
  const card = dataset.expenseCards.find(
    ({ id, businessId: candidate }) => id === cardId && candidate === businessId,
  );
  if (card === undefined) return undefined;
  const cardholder = dataset.expenseCardholders.find(({ id }) => id === card.cardholderId);
  const team = dataset.expenseTeams.find(({ id }) => id === card.spendingTeamId);
  const limit = dataset.cardSpendingLimits.find(({ cardId: candidate }) => candidate === card.id);
  if (cardholder === undefined || team === undefined || limit === undefined) return undefined;
  return { card, cardholder, team, limit };
}

export function getCardTransactions(
  dataset: FinanceDataset,
  businessId: BusinessId,
  cardId: ExpenseCardId,
): CardTransaction[] {
  if (!dataset.expenseCards.some((card) => card.id === cardId && card.businessId === businessId)) {
    return [];
  }
  return dataset.cardTransactions
    .filter((transaction) => transaction.cardId === cardId)
    .sort((left, right) => right.transactedAt.localeCompare(left.transactedAt));
}

export function getCardSpending(
  dataset: FinanceDataset,
  cardId: ExpenseCardId,
  period: ExpenseReportingPeriod,
) {
  if (!dataset.expenseCards.some((card) => card.id === cardId && card.businessId === period.businessId)) {
    return { settledSpendingMinor: 0, pendingSpendingMinor: 0 };
  }
  const transactions = dataset.cardTransactions.filter(
    (transaction) => transaction.cardId === cardId && inPeriod(transaction, period),
  );
  return {
    settledSpendingMinor: transactions.reduce((total, transaction) => total + settledContribution(transaction), 0),
    pendingSpendingMinor: transactions.reduce((total, transaction) => total + pendingContribution(transaction), 0),
  };
}

export type CardLimitUtilisation =
  | { limit: CardSpendingLimit; cumulative: true; spentMinor: number; remainingMinor: number; utilisationPercentage: number }
  | { limit: CardSpendingLimit; cumulative: false; maximumTransactionMinor: number };

export function getCardLimitUtilisation(
  dataset: FinanceDataset,
  cardId: ExpenseCardId,
  period: ExpenseReportingPeriod,
): CardLimitUtilisation | undefined {
  const limit = dataset.cardSpendingLimits.find(({ cardId: candidate }) => candidate === cardId);
  if (
    limit === undefined ||
    limit.currency !== period.currency ||
    !dataset.expenseCards.some(
      (card) => card.id === cardId && card.businessId === period.businessId,
    )
  ) return undefined;
  if (limit.type === "per_transaction") {
    return { limit, cumulative: false, maximumTransactionMinor: limit.amountMinor };
  }
  const limitMonth = period.from.slice(0, 7);
  const transactions = dataset.cardTransactions.filter(
    (transaction) =>
      transaction.cardId === cardId &&
      transaction.currency === limit.currency &&
      (limit.type === "total"
        ? transaction.transactedAt.slice(0, 10) <= period.to
        : transaction.transactedAt.startsWith(limitMonth)),
  );
  const spentMinor = transactions.reduce((total, transaction) => total + settledContribution(transaction), 0);
  return {
    limit,
    cumulative: true,
    spentMinor,
    remainingMinor: limit.amountMinor - spentMinor,
    utilisationPercentage: (spentMinor / limit.amountMinor) * 100,
  };
}

export interface TeamCardholderSpending {
  cardholder: ExpenseCardholder;
  settledSpendingMinor: number;
  pendingSpendingMinor: number;
}

export function getTeamSpendingByCardholder(
  dataset: FinanceDataset,
  teamId: ExpenseTeamId,
  period: ExpenseReportingPeriod,
): TeamCardholderSpending[] {
  if (!dataset.expenseTeams.some((team) => team.id === teamId && team.businessId === period.businessId)) {
    return [];
  }
  const transactions = dataset.cardTransactions.filter(
    (transaction) => transaction.spendingTeamId === teamId && inPeriod(transaction, period),
  );
  const holderIds = [...new Set(transactions.map(({ cardholderId }) => cardholderId))];
  return holderIds.map((cardholderId) => ({
    cardholder: dataset.expenseCardholders.find(({ id }) => id === cardholderId)!,
    settledSpendingMinor: transactions
      .filter((transaction) => transaction.cardholderId === cardholderId)
      .reduce((total, transaction) => total + settledContribution(transaction), 0),
    pendingSpendingMinor: transactions
      .filter((transaction) => transaction.cardholderId === cardholderId)
      .reduce((total, transaction) => total + pendingContribution(transaction), 0),
  }));
}

export function getRecentTeamTransactions(
  dataset: FinanceDataset,
  businessId: BusinessId,
  teamId: ExpenseTeamId,
  limit = 10,
): CardTransaction[] {
  if (!dataset.expenseTeams.some((team) => team.id === teamId && team.businessId === businessId)) {
    return [];
  }
  return dataset.cardTransactions
    .filter(({ spendingTeamId }) => spendingTeamId === teamId)
    .sort((left, right) => right.transactedAt.localeCompare(left.transactedAt))
    .slice(0, limit);
}

export interface ExpenseTransactionDetails {
  transaction: CardTransaction;
  card: ExpenseCard;
  cardholder: ExpenseCardholder;
  team: ExpenseTeam;
  merchant: Merchant;
  expenseRecord?: ExpenseRecord;
}

export interface RecentExpenseTransactionOptions {
  /** Restrict results to transactions historically attributed to this business. */
  businessId?: BusinessId;
  /** Restrict results to the inclusive reporting dates and currency. */
  period?: ExpenseReportingPeriod;
}

export function getRecentExpenseTransactions(
  dataset: FinanceDataset,
  limit = 20,
  options: RecentExpenseTransactionOptions = {},
): ExpenseTransactionDetails[] {
  return [...dataset.cardTransactions]
    .filter(
      (transaction) =>
        (options.businessId === undefined ||
          belongsToBusiness(dataset, transaction, options.businessId)) &&
        (options.period === undefined ||
          (belongsToBusiness(dataset, transaction, options.period.businessId) &&
            inPeriod(transaction, options.period))),
    )
    .sort((left, right) => right.transactedAt.localeCompare(left.transactedAt))
    .slice(0, limit)
    .map((transaction) => ({
      transaction,
      card: dataset.expenseCards.find(({ id }) => id === transaction.cardId)!,
      cardholder: dataset.expenseCardholders.find(({ id }) => id === transaction.cardholderId)!,
      team: dataset.expenseTeams.find(({ id }) => id === transaction.spendingTeamId)!,
      merchant: dataset.merchants.find(({ id }) => id === transaction.merchantId)!,
      ...(dataset.expenseRecords.find(({ cardTransactionId }) => cardTransactionId === transaction.id) === undefined
        ? {}
        : { expenseRecord: dataset.expenseRecords.find(({ cardTransactionId }) => cardTransactionId === transaction.id)! }),
    }));
}
