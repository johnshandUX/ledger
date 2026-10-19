import {
  getTransactions,
  type Transaction,
} from "@johnshandux/ledger-synthetic-finance";

import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "./environment";

export type BankTransaction = Transaction & {
  counterpartyName?: string;
  reference?: string;
};

export function getBankTransactionsForAccount(
  accountId: string,
): BankTransaction[] {
  const counterpartyNames = new Map(
    bankFinanceEnvironment.counterparties.map(({ id, name }) => [id, name]),
  );
  const paymentReferences = new Map(
    bankFinanceEnvironment.payments.map(({ id, reference }) => [id, reference]),
  );

  return getTransactions(bankFinanceEnvironment, {
    businessId: BANK_BUSINESS_ID,
    accountId,
  })
    .map((transaction) => ({
      ...transaction,
      counterpartyName: transaction.counterpartyId
        ? counterpartyNames.get(transaction.counterpartyId)
        : undefined,
      reference: transaction.paymentId
        ? paymentReferences.get(transaction.paymentId)
        : undefined,
    }));
}
