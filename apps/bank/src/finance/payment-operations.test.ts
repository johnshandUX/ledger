import { describe, expect, it } from "vitest";
import { bankFinanceEnvironment, BANK_BUSINESS_ID } from "./environment";
import { PAYMENTS_V2_ACTING_USER_ID, submitPaymentInstruction } from "./payment-operations";

const account = bankFinanceEnvironment.accounts.find(({ id }) => id === "account-main-operating")!;
const beneficiary = bankFinanceEnvironment.beneficiaries.find(({ currency }) => currency === "GBP")!;
const state = {
  baseline: bankFinanceEnvironment,
  accounts: bankFinanceEnvironment.accounts,
  balances: bankFinanceEnvironment.balances,
  beneficiaries: bankFinanceEnvironment.beneficiaries,
  payments: bankFinanceEnvironment.payments,
  users: bankFinanceEnvironment.users,
};

function command() {
  return {
    id: "payment-session-test",
    businessId: BANK_BUSINESS_ID,
    actingUserId: PAYMENTS_V2_ACTING_USER_ID,
    sourceAccountId: account.id,
    amountMinor: 12_345,
    currency: "GBP" as const,
    reference: "INV-12345",
    execution: { kind: "immediate" as const },
    recipient: { kind: "existing" as const, beneficiaryId: beneficiary.id },
  };
}

describe("submitPaymentInstruction", () => {
  it("creates a processing payment for the explicitly authorised administrator", () => {
    const result = submitPaymentInstruction(command(), state, "2026-10-09T10:00:00Z");
    expect(result).toMatchObject({ ok: true, payment: { status: "processing", createdByUserId: "user-amelia-hart" } });
    if (result.ok) expect(result.deltas.map(({ collection }) => collection)).toEqual(["payments"]);
  });

  it("creates a scheduled payment without approvals, balances or ledger changes", () => {
    const result = submitPaymentInstruction({
      ...command(),
      execution: { kind: "scheduled", date: "2026-10-12" },
    }, state, "2026-10-09T10:00:00Z");
    expect(result).toMatchObject({ ok: true, payment: { status: "scheduled", scheduledFor: "2026-10-12" } });
    if (result.ok) expect(result.deltas.map(({ collection }) => collection)).toEqual(["payments"]);
  });

  it("rejects another user even when they otherwise have payment permissions", () => {
    const result = submitPaymentInstruction({ ...command(), actingUserId: "user-daniel-okafor" }, state, "2026-10-09T10:00:00Z");
    expect(result).toMatchObject({ ok: false, errors: expect.arrayContaining([expect.objectContaining({ code: "independent-submission-not-authorised" })]) });
  });

  it("rejects duplicate identifiers without producing overlay deltas", () => {
    const duplicate = bankFinanceEnvironment.payments[0]!;
    const result = submitPaymentInstruction({ ...command(), id: duplicate.id }, state, "2026-10-09T10:00:00Z");
    expect(result).toMatchObject({ ok: false, errors: expect.arrayContaining([expect.objectContaining({ code: "duplicate-payment-id" })]) });
  });

  it("atomically creates a new recipient destination and its payment", () => {
    const result = submitPaymentInstruction({ ...command(), recipient: { kind: "new", beneficiary: {
      id: "beneficiary-session-test", businessId: BANK_BUSINESS_ID, name: "New supplier", accountName: "New supplier", accountNumber: "12345678", sortCode: "123456", currency: "GBP",
    } } }, state, "2026-10-09T10:00:00Z");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.deltas.map(({ collection }) => collection)).toEqual(["beneficiaries", "payments"]);
  });
});
