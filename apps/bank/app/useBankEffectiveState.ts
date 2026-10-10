"use client";

import { useMemo } from "react";
import type {
  AccountId,
  BalanceSnapshotId,
  BeneficiaryId,
  PaymentApprovalId,
  PaymentId,
  UserId,
} from "@johnshandux/ledger-synthetic-finance";
import {
  selectEffectiveAccountById,
  selectEffectiveAccounts,
  selectEffectiveBalanceById,
  selectEffectiveBalances,
  selectEffectiveBeneficiaries,
  selectEffectiveBeneficiaryById,
  selectEffectivePaymentApprovalById,
  selectEffectivePaymentApprovals,
  selectEffectivePaymentById,
  selectEffectivePayments,
  selectEffectiveUserById,
  selectEffectiveUsers,
} from "../src/state/effective-state";
import { useBankState } from "./BankStateProvider";

export function useEffectiveAccounts() {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveAccounts({ baseline: baseline.accounts, overlay: overlay.accounts }),
    [baseline.accounts, overlay.accounts],
  );
}

export function useEffectiveAccountById(accountId: AccountId) {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveAccountById(
      { baseline: baseline.accounts, overlay: overlay.accounts },
      accountId,
    ),
    [accountId, baseline.accounts, overlay.accounts],
  );
}

export function useEffectiveBalances() {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveBalances({ baseline: baseline.balances, overlay: overlay.balances }),
    [baseline.balances, overlay.balances],
  );
}

export function useEffectiveBeneficiaries() {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveBeneficiaries({ baseline: baseline.beneficiaries, overlay: overlay.beneficiaries }),
    [baseline.beneficiaries, overlay.beneficiaries],
  );
}

export function useEffectiveBeneficiaryById(beneficiaryId: BeneficiaryId) {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveBeneficiaryById(
      { baseline: baseline.beneficiaries, overlay: overlay.beneficiaries },
      beneficiaryId,
    ),
    [baseline.beneficiaries, beneficiaryId, overlay.beneficiaries],
  );
}

export function useEffectiveBalanceById(balanceId: BalanceSnapshotId) {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveBalanceById(
      { baseline: baseline.balances, overlay: overlay.balances },
      balanceId,
    ),
    [balanceId, baseline.balances, overlay.balances],
  );
}

export function useEffectivePayments() {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectivePayments({ baseline: baseline.payments, overlay: overlay.payments }),
    [baseline.payments, overlay.payments],
  );
}

export function useEffectivePaymentById(paymentId: PaymentId) {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectivePaymentById(
      { baseline: baseline.payments, overlay: overlay.payments },
      paymentId,
    ),
    [baseline.payments, overlay.payments, paymentId],
  );
}

export function useEffectivePaymentApprovals() {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectivePaymentApprovals({
      baseline: baseline.paymentApprovals,
      overlay: overlay.paymentApprovals,
    }),
    [baseline.paymentApprovals, overlay.paymentApprovals],
  );
}

export function useEffectivePaymentApprovalById(approvalId: PaymentApprovalId) {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectivePaymentApprovalById(
      {
        baseline: baseline.paymentApprovals,
        overlay: overlay.paymentApprovals,
      },
      approvalId,
    ),
    [approvalId, baseline.paymentApprovals, overlay.paymentApprovals],
  );
}

export function useEffectiveUsers() {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveUsers({ baseline: baseline.users, overlay: overlay.users }),
    [baseline.users, overlay.users],
  );
}

export function useEffectiveUserById(userId: UserId) {
  const { baseline, overlay } = useBankState();
  return useMemo(
    () => selectEffectiveUserById(
      { baseline: baseline.users, overlay: overlay.users },
      userId,
    ),
    [baseline.users, overlay.users, userId],
  );
}
