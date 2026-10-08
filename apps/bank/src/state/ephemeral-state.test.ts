import { describe, expect, it } from "vitest";
import {
  createCaldermereScenario,
  type Payment,
  type User,
} from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../finance/environment";
import {
  bankEphemeralReducer,
  createBankEphemeralState,
  createInitialFinanceOverlay,
} from "./ephemeral-state";

const createdPayment: Payment = {
  ...bankFinanceEnvironment.payments[0]!,
  id: "payment-ephemeral-test",
  reference: "EDS-TEST-001",
};

describe("bank ephemeral state", () => {
  it("initialises deterministically with the supplied baseline and an empty overlay", () => {
    const first = createBankEphemeralState(bankFinanceEnvironment);
    const second = createBankEphemeralState(bankFinanceEnvironment);

    expect(first.baseline).toBe(bankFinanceEnvironment);
    expect(second.baseline).toBe(bankFinanceEnvironment);
    expect(first.overlay).toEqual(createInitialFinanceOverlay());
    expect(second.overlay).toEqual(first.overlay);
    expect(second.overlay).not.toBe(first.overlay);
  });

  it("uses the same deterministic baseline produced for server-side Bank reads", () => {
    const state = createBankEphemeralState(bankFinanceEnvironment);

    expect(state.baseline).toEqual(
      createCaldermereScenario({ scenario: "normal-trading" }),
    );
  });

  it("keeps separately initialised application instances isolated", () => {
    const first = createBankEphemeralState(bankFinanceEnvironment);
    const second = createBankEphemeralState(bankFinanceEnvironment);
    const changedFirst = bankEphemeralReducer(first, {
      type: "apply-overlay-delta",
      delta: { collection: "payments", change: { kind: "create", record: createdPayment } },
    });

    expect(changedFirst.overlay.payments.created[createdPayment.id]).toEqual(createdPayment);
    expect(second.overlay.payments.created).toEqual({});
  });

  it("creates normalized records without mutating the previous state", () => {
    const initial = createBankEphemeralState(bankFinanceEnvironment);
    const next = bankEphemeralReducer(initial, {
      type: "apply-overlay-delta",
      delta: { collection: "payments", change: { kind: "create", record: createdPayment } },
    });

    expect(initial.overlay.payments.created).toEqual({});
    expect(next.overlay.payments.created[createdPayment.id]).toEqual(createdPayment);
    expect(next.overlay.payments).not.toBe(initial.overlay.payments);
    expect(next.overlay.accounts).toBe(initial.overlay.accounts);
    expect(next.baseline).toBe(initial.baseline);
  });

  it("merges updates immutably and folds updates into records created in the overlay", () => {
    const initial = createBankEphemeralState(bankFinanceEnvironment);
    const withCreated = bankEphemeralReducer(initial, {
      type: "apply-overlay-delta",
      delta: { collection: "payments", change: { kind: "create", record: createdPayment } },
    });
    const withCreatedUpdate = bankEphemeralReducer(withCreated, {
      type: "apply-overlay-delta",
      delta: {
        collection: "payments",
        change: { kind: "update", id: createdPayment.id, changes: { status: "scheduled" } },
      },
    });
    const baselineUser = bankFinanceEnvironment.users[0]!;
    const withBaselineUpdate = bankEphemeralReducer(withCreatedUpdate, {
      type: "apply-overlay-delta",
      delta: {
        collection: "users",
        change: {
          kind: "update",
          id: baselineUser.id,
          changes: { firstName: "Updated" },
        },
      },
    });

    expect(withCreated.overlay.payments.created[createdPayment.id]?.status).toBe(
      createdPayment.status,
    );
    expect(withCreatedUpdate.overlay.payments.created[createdPayment.id]?.status).toBe(
      "scheduled",
    );
    expect(withCreatedUpdate.overlay.payments.updated).toEqual({});
    expect(withBaselineUpdate.overlay.users.updated[baselineUser.id]).toEqual({
      firstName: "Updated",
    } satisfies Partial<User>);
  });

  it("represents deletion with a tombstone and leaves the baseline record intact", () => {
    const baselinePayment = bankFinanceEnvironment.payments[0]!;
    const initial = createBankEphemeralState(bankFinanceEnvironment);
    const next = bankEphemeralReducer(initial, {
      type: "apply-overlay-delta",
      delta: {
        collection: "payments",
        change: { kind: "tombstone", id: baselinePayment.id },
      },
    });

    expect(next.overlay.payments.tombstones[baselinePayment.id]).toBe(true);
    expect(next.baseline.payments[0]).toBe(baselinePayment);
    expect(initial.overlay.payments.tombstones).toEqual({});
  });

  it("resets only the overlay and retains the immutable baseline reference", () => {
    const initial = createBankEphemeralState(bankFinanceEnvironment);
    const changed = bankEphemeralReducer(initial, {
      type: "apply-overlay-delta",
      delta: { collection: "payments", change: { kind: "create", record: createdPayment } },
    });
    const reset = bankEphemeralReducer(changed, { type: "reset-overlay" });

    expect(reset.overlay).toEqual(createInitialFinanceOverlay());
    expect(reset.overlay).not.toBe(initial.overlay);
    expect(reset.baseline).toBe(bankFinanceEnvironment);
  });

  it("does not mutate the Synthetic Finance baseline across overlay operations", () => {
    const before = structuredClone(bankFinanceEnvironment);
    const initial = createBankEphemeralState(bankFinanceEnvironment);
    const updated = bankEphemeralReducer(initial, {
      type: "apply-overlay-delta",
      delta: {
        collection: "accounts",
        change: {
          kind: "update",
          id: bankFinanceEnvironment.accounts[0]!.id,
          changes: { name: "Ephemeral name" },
        },
      },
    });

    expect(updated.baseline).toEqual(before);
    expect(bankFinanceEnvironment).toEqual(before);
  });
});
