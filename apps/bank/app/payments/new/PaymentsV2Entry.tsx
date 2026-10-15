"use client";

import { getLatestBalanceForAccount } from "../../../src/finance/accounts";
import { getPaymentSourceEligibility } from "../../../src/finance/payment-sources";
import { maskAccountNumber } from "../../../src/presentation/payments";
import { useEffectiveAccounts, useEffectiveBalances } from "../../useBankEffectiveState";
import { PaymentsV2Prototype } from "../../dev/payments-v2/PaymentsV2Prototype";
import type { PrototypeAccount, PrototypeRecipient, PrototypeRecipientGroup } from "../../dev/payments-v2/prototype-model";

type PaymentsV2EntryProps = Readonly<{
  requestedSourceAccountId?: string;
  sourceAccountRequested: boolean;
  recipients: readonly PrototypeRecipient[];
  recipientGroups: readonly PrototypeRecipientGroup[];
  referenceDate: string;
}>;

export function PaymentsV2Entry({
  requestedSourceAccountId,
  sourceAccountRequested,
  recipients,
  recipientGroups,
  referenceDate,
}: PaymentsV2EntryProps) {
  const effectiveAccounts = useEffectiveAccounts();
  const effectiveBalances = useEffectiveBalances();

  const accounts: PrototypeAccount[] = effectiveAccounts.flatMap((account) => {
    if (!getPaymentSourceEligibility(account).eligible || !account.accountNumber) return [];
    const balance = getLatestBalanceForAccount(effectiveBalances, account.id);
    if (!balance) return [];
    return [{
      id: account.id,
      name: account.name,
      maskedIdentifier: maskAccountNumber(account.accountNumber),
      currency: "GBP" as const,
      availableBalanceMinor: balance.availableBalanceMinor,
    }];
  });

  const requestedAccount = sourceAccountRequested
    ? effectiveAccounts.find(({ id }) => id === requestedSourceAccountId)
    : undefined;
  const requestedEligibility = requestedAccount
    ? getPaymentSourceEligibility(requestedAccount)
    : undefined;
  const requestedBalance = requestedAccount
    ? getLatestBalanceForAccount(effectiveBalances, requestedAccount.id)
    : undefined;
  const sourceAccountSelectionError = !sourceAccountRequested
    ? undefined
    : !requestedAccount
      ? "The selected source account is unavailable. Choose an eligible account to continue."
      : requestedEligibility && !requestedEligibility.eligible
        ? `${requestedEligibility.reason} Choose an eligible account to continue.`
        : !requestedBalance
          ? "The selected account balance is unavailable. Choose another eligible account to continue."
          : undefined;
  const initialSourceAccountId = sourceAccountRequested && !sourceAccountSelectionError
    ? requestedSourceAccountId
    : undefined;

  return (
    <PaymentsV2Prototype
      accounts={accounts}
      recipients={recipients}
      recipientGroups={recipientGroups}
      referenceDate={referenceDate}
      initialSourceAccountId={initialSourceAccountId}
      requireSourceAccountSelection={Boolean(sourceAccountSelectionError)}
      sourceAccountSelectionError={sourceAccountSelectionError}
    />
  );
}
