import {
  caldermereDataset,
  getCardLimitUtilisation,
  getExpenseCardById,
  getExpenseCards,
  getExpenseOrganisationSummary,
  getExpenseTeamsWithSummaries,
  getRecentExpenseTransactions,
  getRecentTeamTransactions,
  getTeamSpendingByCardholder,
  type ExpenseReportingPeriod,
} from "@johnshandux/ledger-synthetic-finance";

export const EXPENSE_REPORTING_PERIOD = {
  businessId: caldermereDataset.businesses[0]!.id,
  from: "2026-10-01",
  to: "2026-10-31",
  currency: "GBP",
} as const satisfies ExpenseReportingPeriod;

export function getExpensesOverviewModel() {
  return {
    summary: getExpenseOrganisationSummary(caldermereDataset, EXPENSE_REPORTING_PERIOD),
    teams: getExpenseTeamsWithSummaries(caldermereDataset, EXPENSE_REPORTING_PERIOD),
    recentTransactions: getRecentExpenseTransactions(caldermereDataset, 8, {
      businessId: EXPENSE_REPORTING_PERIOD.businessId,
      period: EXPENSE_REPORTING_PERIOD,
    }),
  };
}

export function getExpenseTeamModel(teamId: string) {
  const team = caldermereDataset.expenseTeams.find(
    (candidate) => candidate.id === teamId && candidate.businessId === EXPENSE_REPORTING_PERIOD.businessId,
  );
  if (!team) return undefined;

  const summary = getExpenseTeamsWithSummaries(caldermereDataset, EXPENSE_REPORTING_PERIOD)
    .find((candidate) => candidate.team.id === team.id)!;
  const cards = getExpenseCards(caldermereDataset, {
    businessId: EXPENSE_REPORTING_PERIOD.businessId,
    spendingTeamId: team.id,
  }).map((card) => ({
    ...getExpenseCardById(caldermereDataset, EXPENSE_REPORTING_PERIOD.businessId, card.id)!,
    utilisation: getCardLimitUtilisation(caldermereDataset, card.id, EXPENSE_REPORTING_PERIOD),
  }));
  const spendingByCardholder = getTeamSpendingByCardholder(caldermereDataset, team.id, EXPENSE_REPORTING_PERIOD);
  const relevantCardholderIds = new Set([
    ...cards.map(({ card }) => card.cardholderId),
    ...spendingByCardholder.map(({ cardholder }) => cardholder.id),
  ]);
  const cardholders = [...relevantCardholderIds].map((cardholderId) => {
    const spending = spendingByCardholder.find(({ cardholder }) => cardholder.id === cardholderId);
    const cardholder = spending?.cardholder ?? caldermereDataset.expenseCardholders.find(({ id }) => id === cardholderId)!;
    return {
      cardholder,
      primaryTeam: caldermereDataset.expenseTeams.find(({ id }) => id === cardholder.primaryTeamId)!,
      attributedCards: cards.filter(({ card }) => card.cardholderId === cardholderId),
      settledSpendingMinor: spending?.settledSpendingMinor ?? 0,
      pendingSpendingMinor: spending?.pendingSpendingMinor ?? 0,
    };
  }).sort((left, right) => right.settledSpendingMinor - left.settledSpendingMinor || left.cardholder.displayName.localeCompare(right.cardholder.displayName));
  const recentTransactions = getRecentTeamTransactions(
    caldermereDataset, EXPENSE_REPORTING_PERIOD.businessId, team.id, 10,
  ).map((transaction) => ({
    transaction,
    cardholder: caldermereDataset.expenseCardholders.find(({ id }) => id === transaction.cardholderId)!,
    merchant: caldermereDataset.merchants.find(({ id }) => id === transaction.merchantId)!,
  }));

  return { team, summary, cards, cardholders, recentTransactions };
}

export function getExpenseTeamStaticParams() {
  return caldermereDataset.expenseTeams
    .filter(({ businessId }) => businessId === EXPENSE_REPORTING_PERIOD.businessId)
    .map(({ id }) => ({ teamId: id }));
}
