import users from "../fixtures/users";
import businesses from "../fixtures/businesses";
import businessProfiles from "../fixtures/businessProfiles";
import accounts from "../fixtures/accounts";
import transactions from "../fixtures/transactions";
import payments from "../fixtures/payments";
import beneficiaries from "../fixtures/beneficiaries";
import mandates from "../fixtures/mandates";
import activeSession from "../fixtures/activeSession";

import { User } from "../domain/User";
import { Business } from "../domain/Business";
import { BusinessProfile } from "../domain/BusinessProfile";
import { Account } from "../domain/Account";
import { Transaction } from "../domain/Transaction";
import { Payment } from "../domain/Payment";
import { Beneficiary } from "../domain/Beneficiary";
import { Permission } from "../domain/Permission";

export type AccountAccessResult =
  | { status: "not-authorised" }
  | { status: "not-found" }
  | { status: "allowed"; account: Account; canViewTransactions: boolean };

export function getUser(userId: string): User | undefined {
  return users.find((u) => u.id === userId);
}

export function getBusiness(businessId: string): Business | undefined {
  return businesses.find((b) => b.id === businessId);
}

export function getBusinessProfile(profileId: string): BusinessProfile | undefined {
  return businessProfiles.find((p) => p.id === profileId);
}

export function getBusinessProfilesForUser(userId: string): BusinessProfile[] {
  return businessProfiles.filter((p) => p.userId === userId);
}

export function getBusinessForProfile(profileId: string): Business | undefined {
  const p = getBusinessProfile(profileId);
  return p ? getBusiness(p.businessId) : undefined;
}

function getAccountsForBusiness(businessId: string): Account[] {
  return accounts.filter((a) => a.businessId === businessId);
}

export function getAccountsForProfile(profileId: string): Account[] {
  const p = getBusinessProfile(profileId);
  if (!p || !p.permissions.includes("accounts:view")) return [];
  return getAccountsForBusiness(p.businessId);
}

function findAccount(accountId: string): Account | undefined {
  return accounts.find((a) => a.id === accountId);
}

function findTransactionsForAccount(accountId: string): Transaction[] {
  return transactions
    .filter((t) => t.accountId === accountId)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt) || b.id.localeCompare(a.id));
}

export function getAccountAccessForProfile(profileId: string, accountId: string): AccountAccessResult {
  const profile = getBusinessProfile(profileId);
  if (!profile || !profile.permissions.includes("accounts:view")) {
    return { status: "not-authorised" };
  }

  const account = findAccount(accountId);
  if (!account || account.businessId !== profile.businessId) {
    return { status: "not-found" };
  }

  return {
    status: "allowed",
    account,
    canViewTransactions: profile.permissions.includes("accounts:transactions:view"),
  };
}

export function getTransactionsForProfileAccount(profileId: string, accountId: string): Transaction[] | undefined {
  const access = getAccountAccessForProfile(profileId, accountId);
  if (access.status !== "allowed" || !access.canViewTransactions) return undefined;
  return findTransactionsForAccount(accountId);
}

export function getPaymentsForBusiness(businessId: string): Payment[] {
  return payments.filter((p) => p.businessId === businessId);
}

export function getPaymentsForProfile(profileId: string): Payment[] {
  const p = getBusinessProfile(profileId);
  if (!p) return [];
  return getPaymentsForBusiness(p.businessId).filter((pay) => pay.createdByProfileId === profileId || true);
}

export function getPaymentsAwaitingApproval(profileId: string): Payment[] {
  const profile = getBusinessProfile(profileId);
  if (!profile) return [];
  const businessId = profile.businessId;
  return payments.filter((p) => p.businessId === businessId && p.status === "pending-approval");
}

export function getBeneficiariesForBusiness(businessId: string): Beneficiary[] {
  return beneficiaries.filter((b) => b.businessId === businessId);
}

export function hasPermission(profileId: string, permission: Permission): boolean {
  const p = getBusinessProfile(profileId);
  if (!p) return false;
  return p.permissions.includes(permission);
}

// Active session helpers
export function getActiveSession() {
  return activeSession;
}

export function getActiveUser() {
  return getUser(activeSession.activeUserId);
}

export function getActiveBusinessProfile() {
  return getBusinessProfile(activeSession.activeBusinessProfileId);
}

export default {
  getUser,
  getBusiness,
  getBusinessProfile,
  getBusinessProfilesForUser,
  getBusinessForProfile,
  getAccountsForProfile,
  getAccountAccessForProfile,
  getTransactionsForProfileAccount,
  getPaymentsForBusiness,
  getPaymentsForProfile,
  getPaymentsAwaitingApproval,
  getBeneficiariesForBusiness,
  hasPermission,
  getActiveSession,
  getActiveUser,
  getActiveBusinessProfile,
};
