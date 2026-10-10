import { describe, expect, it } from "vitest";
import type { Payment } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../finance/environment";
import {
  createBankEphemeralState,
  createInitialFinanceOverlay,
  type BankEphemeralState,
  type EntityOverlay,
  type FinanceOverlay,
} from "./ephemeral-state";
import {
  selectEffectiveAccountById,
  selectEffectiveAccounts,
  selectEffectiveBalanceById,
  selectEffectiveBalances,
  selectEffectivePaymentApprovalById,
  selectEffectivePaymentApprovals,
  selectEffectivePaymentById,
  selectEffectivePayments,
  selectEffectiveUserById,
  selectEffectiveUsers,
} from "./effective-state";

function withOverlay(overlay: FinanceOverlay): BankEphemeralState {
  return { baseline: bankFinanceEnvironment, overlay };
}

function withCollection<Collection extends keyof FinanceOverlay>(
  collection: Collection,
  value: FinanceOverlay[Collection],
): BankEphemeralState {
  return withOverlay({ ...createInitialFinanceOverlay(), [collection]: value });
}

function paymentSource(state: BankEphemeralState) {
  return { baseline: state.baseline.payments, overlay: state.overlay.payments };
}

describe("effective-state selectors", () => {
  it("returns baseline collections and record references for an empty overlay", () => {
    const state = createBankEphemeralState(bankFinanceEnvironment);

    expect(selectEffectiveAccounts({
      baseline: state.baseline.accounts,
      overlay: state.overlay.accounts,
    })).toBe(state.baseline.accounts);
    expect(selectEffectiveBalances({
      baseline: state.baseline.balances,
      overlay: state.overlay.balances,
    })).toBe(state.baseline.balances);
    expect(selectEffectivePayments(paymentSource(state))).toBe(state.baseline.payments);
    expect(selectEffectivePaymentApprovals({
      baseline: state.baseline.paymentApprovals,
      overlay: state.overlay.paymentApprovals,
    })).toBe(state.baseline.paymentApprovals);
    expect(selectEffectiveUsers({
      baseline: state.baseline.users,
      overlay: state.overlay.users,
    })).toBe(state.baseline.users);
  });

  it("appends created records in explicit creation order and resolves them by id", () => {
    const template = bankFinanceEnvironment.payments[0]!;
    const first: Payment = { ...template, id: "payment-created-first" };
    const second: Payment = { ...template, id: "payment-created-second" };
    const overlay: EntityOverlay<Payment> = {
      created: { [first.id]: first, [second.id]: second },
      createdOrder: [second.id, first.id],
      updated: {},
      tombstones: {},
    };
    const state = withCollection("payments", overlay);
    const effective = selectEffectivePayments(paymentSource(state));

    expect(effective.slice(-2).map(({ id }) => id)).toEqual([second.id, first.id]);
    expect(selectEffectivePaymentById(paymentSource(state), first.id)).toBe(first);
    expect(effective[0]).toBe(bankFinanceEnvironment.payments[0]);
  });

  it("uses a deterministic id fallback when explicit created order is incomplete", () => {
    const template = bankFinanceEnvironment.payments[0]!;
    const uppercase: Payment = { ...template, id: "payment-created-Z" };
    const punctuation: Payment = { ...template, id: "payment-created_" };
    const lowercase: Payment = { ...template, id: "payment-created-a" };
    const overlay: EntityOverlay<Payment> = {
      created: {
        [lowercase.id]: lowercase,
        [punctuation.id]: punctuation,
        [uppercase.id]: uppercase,
      },
      createdOrder: [],
      updated: {},
      tombstones: {},
    };
    const state = withCollection("payments", overlay);

    expect(selectEffectivePayments(paymentSource(state)).slice(-3).map(({ id }) => id))
      .toEqual([uppercase.id, lowercase.id, punctuation.id]);
  });

  it("shallowly applies partial updates while retaining fields and canonical identity", () => {
    const baseline = bankFinanceEnvironment.payments[0]!;
    const before = structuredClone(baseline);
    const overlay: EntityOverlay<Payment> = {
      created: {},
      createdOrder: [],
      updated: {
        [baseline.id]: {
          reference: "UPDATED-REFERENCE",
          id: "attempted-id-change",
        } as never,
      },
      tombstones: {},
    };
    const state = withCollection("payments", overlay);
    const effective = selectEffectivePaymentById(paymentSource(state), baseline.id);

    expect(effective).toMatchObject({
      id: baseline.id,
      reference: "UPDATED-REFERENCE",
      amountMinor: baseline.amountMinor,
      beneficiaryId: baseline.beneficiaryId,
    });
    expect(effective).not.toBe(baseline);
    expect(baseline).toEqual(before);
  });

  it("replaces user banking role and additional access arrays without mutating baseline", () => {
    const baseline = bankFinanceEnvironment.users.find(
      ({ id }) => id === "user-amelia-hart",
    )!;
    const before = structuredClone(baseline);
    const overlay = {
      created: {},
      createdOrder: [],
      updated: {
        [baseline.id]: {
          roleIds: ["role-viewer"],
          additionalAccessIds: [],
        },
      },
      tombstones: {},
    } satisfies EntityOverlay<typeof baseline>;
    const source = { baseline: bankFinanceEnvironment.users, overlay };

    expect(selectEffectiveUserById(source, baseline.id)).toMatchObject({
      roleIds: ["role-viewer"],
      additionalAccessIds: [],
    });
    expect(baseline).toEqual(before);
  });

  it("gives tombstones precedence over baseline, created and updated records", () => {
    const baseline = bankFinanceEnvironment.payments[0]!;
    const created: Payment = { ...baseline, id: "payment-created-tombstoned" };
    const overlay: EntityOverlay<Payment> = {
      created: { [baseline.id]: { ...baseline, reference: "CREATED-WINS-BASE" }, [created.id]: created },
      createdOrder: [baseline.id, created.id],
      updated: {
        [baseline.id]: { reference: "UPDATE-WINS-CREATED" },
        [created.id]: { reference: "UPDATED-CREATED" },
      },
      tombstones: { [baseline.id]: true, [created.id]: true },
    };
    const state = withCollection("payments", overlay);

    expect(selectEffectivePaymentById(paymentSource(state), baseline.id)).toBeUndefined();
    expect(selectEffectivePaymentById(paymentSource(state), created.id)).toBeUndefined();
    expect(selectEffectivePayments(paymentSource(state))).not.toContainEqual(
      expect.objectContaining({ id: baseline.id }),
    );
    expect(bankFinanceEnvironment.payments).toContain(baseline);
  });

  it("applies updates over a conflicting created record and keeps its baseline position", () => {
    const baseline = bankFinanceEnvironment.payments[0]!;
    const overlay: EntityOverlay<Payment> = {
      created: { [baseline.id]: { ...baseline, reference: "CREATED" } },
      createdOrder: [baseline.id],
      updated: { [baseline.id]: { reference: "UPDATED" } },
      tombstones: {},
    };
    const state = withCollection("payments", overlay);
    const effective = selectEffectivePayments(paymentSource(state));

    expect(effective).toHaveLength(bankFinanceEnvironment.payments.length);
    expect(effective[0]).toMatchObject({ id: baseline.id, reference: "UPDATED" });
  });

  it("returns undefined for tombstoned and unknown individual records", () => {
    const user = bankFinanceEnvironment.users[0]!;
    const state = withCollection("users", {
      created: {},
      createdOrder: [],
      updated: {},
      tombstones: { [user.id]: true },
    });
    const source = { baseline: state.baseline.users, overlay: state.overlay.users };

    expect(selectEffectiveUserById(source, user.id)).toBeUndefined();
    expect(selectEffectiveUserById(source, "unknown-user")).toBeUndefined();
    expect(selectEffectiveUsers(source)).toHaveLength(bankFinanceEnvironment.users.length - 1);
  });

  it("does not cascade tombstones or rewrite surviving relationships", () => {
    const payment = bankFinanceEnvironment.payments.find((item) =>
      bankFinanceEnvironment.paymentApprovals.some(({ paymentId }) => paymentId === item.id),
    )!;
    const approval = bankFinanceEnvironment.paymentApprovals.find(
      ({ paymentId }) => paymentId === payment.id,
    )!;
    const state = withOverlay({
      ...createInitialFinanceOverlay(),
      payments: {
        created: {},
        createdOrder: [],
        updated: {},
        tombstones: { [payment.id]: true },
      },
    });

    expect(selectEffectivePaymentById(paymentSource(state), payment.id)).toBeUndefined();
    expect(selectEffectivePaymentApprovalById(
      {
        baseline: state.baseline.paymentApprovals,
        overlay: state.overlay.paymentApprovals,
      },
      approval.id,
    )).toBe(approval);
    expect(approval.paymentId).toBe(payment.id);
  });

  it("preserves account and user identifiers referenced by surviving records", () => {
    const payment = bankFinanceEnvironment.payments[0]!;
    const account = selectEffectiveAccountById(
      {
        baseline: bankFinanceEnvironment.accounts,
        overlay: createInitialFinanceOverlay().accounts,
      },
      payment.sourceAccountId,
    );
    const user = selectEffectiveUserById(
      {
        baseline: bankFinanceEnvironment.users,
        overlay: createInitialFinanceOverlay().users,
      },
      payment.createdByUserId,
    );
    const balance = bankFinanceEnvironment.balances[0]!;

    expect(account?.id).toBe(payment.sourceAccountId);
    expect(user?.id).toBe(payment.createdByUserId);
    expect(selectEffectiveBalanceById(
      {
        baseline: bankFinanceEnvironment.balances,
        overlay: createInitialFinanceOverlay().balances,
      },
      balance.id,
    )).toBe(balance);
  });

  it("produces equal results for identical inputs without mutating either input", () => {
    const baselineBefore = structuredClone(bankFinanceEnvironment.payments);
    const overlay: EntityOverlay<Payment> = {
      created: {},
      createdOrder: [],
      updated: {
        [bankFinanceEnvironment.payments[0]!.id]: { reference: "DETERMINISTIC" },
      },
      tombstones: {},
    };
    const overlayBefore = structuredClone(overlay);
    const source = { baseline: bankFinanceEnvironment.payments, overlay };

    expect(selectEffectivePayments(source)).toEqual(selectEffectivePayments(source));
    expect(bankFinanceEnvironment.payments).toEqual(baselineBefore);
    expect(overlay).toEqual(overlayBefore);
  });
});
