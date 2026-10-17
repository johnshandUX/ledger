import {
  CALDERMERE_AS_OF,
  caldermereDataset,
  getAccounts,
  getLiquidityPosition,
  getOutstandingApprovalActions,
  getPaymentsAwaitingApproval,
  getTransactions,
} from "@johnshandux/ledger-synthetic-finance";
import type { GenerativeFinanceData } from "./types";

const BUSINESS_ID = "business-caldermere";

export function prepareGenerativeFinanceData(): GenerativeFinanceData {
  const accounts = getAccounts(caldermereDataset, { businessId: BUSINESS_ID });
  const balancesByAccount = new Map(
    caldermereDataset.balances.map((balance) => [balance.accountId, balance]),
  );
  const transactions = getTransactions(caldermereDataset, { businessId: BUSINESS_ID });
  const payments = getPaymentsAwaitingApproval(caldermereDataset, { businessId: BUSINESS_ID });
  const approvals = getOutstandingApprovalActions(caldermereDataset, { businessId: BUSINESS_ID });
  const beneficiaryNames = new Map(
    caldermereDataset.beneficiaries.map((beneficiary) => [beneficiary.id, beneficiary.name]),
  );

  return {
    asOf: CALDERMERE_AS_OF,
    availableByCurrency: getLiquidityPosition(caldermereDataset, { businessId: BUSINESS_ID })
      .byCurrency.map(({ availableBalanceMinor, currency }) => ({
        amountMinor: availableBalanceMinor,
        currency,
      })),
    accounts: accounts
      .filter(({ status }) => status !== "closed")
      .map((account) => ({
        id: account.id,
        name: account.name,
        accountNumber: account.accountNumber ?? "—",
        amountMinor: balancesByAccount.get(account.id)?.availableBalanceMinor ?? 0,
        currency: account.currency,
      }))
      .sort((left, right) => right.amountMinor - left.amountMinor)
      .slice(0, 4),
    activity: transactions.slice(0, 5).map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      amountMinor: transaction.amountMinor,
      currency: transaction.currency,
      direction: transaction.direction,
      time: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(new Date(transaction.bookedAt)),
    })),
    cashFlow: buildCashFlow(transactions),
    payments: payments.map((payment) => ({
      id: payment.id,
      beneficiary: beneficiaryNames.get(payment.beneficiaryId) ?? "Beneficiary",
      reference: payment.reference,
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      approvals: approvals.filter(({ paymentId }) => paymentId === payment.id).length,
    })),
    outstandingApprovalActions: approvals.length,
  };
}

function buildCashFlow(
  transactions: ReturnType<typeof getTransactions>,
): GenerativeFinanceData["cashFlow"] {
  const days = ["03", "04", "05", "06", "07"];
  return days.map((day) => {
    const daily = transactions.filter(({ valueDate, currency }) =>
      valueDate.endsWith(`-${day}`) && currency === "GBP",
    );
    return {
      label: `${day} Oct`,
      incomingMinor: daily
        .filter(({ direction }) => direction === "credit")
        .reduce((sum, { amountMinor }) => sum + amountMinor, 0),
      outgoingMinor: daily
        .filter(({ direction }) => direction === "debit")
        .reduce((sum, { amountMinor }) => sum + amountMinor, 0),
    };
  });
}
