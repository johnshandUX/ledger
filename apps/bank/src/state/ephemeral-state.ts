import type {
  Account,
  BalanceSnapshot,
  Beneficiary,
  DeepReadonly,
  FinanceDataset,
  Payment,
  PaymentApproval,
  User,
} from "@johnshandux/ledger-synthetic-finance";

export type OverlayPatch<Entity extends { id: string }> = Readonly<
  Partial<Omit<Entity, "id">>
>;

export type EntityOverlay<Entity extends { id: string }> = Readonly<{
  created: Readonly<Record<string, DeepReadonly<Entity>>>;
  createdOrder: readonly Entity["id"][];
  updated: Readonly<Record<string, OverlayPatch<Entity>>>;
  tombstones: Readonly<Record<string, true>>;
}>;

export type FinanceOverlay = Readonly<{
  accounts: EntityOverlay<Account>;
  balances: EntityOverlay<BalanceSnapshot>;
  beneficiaries: EntityOverlay<Beneficiary>;
  payments: EntityOverlay<Payment>;
  paymentApprovals: EntityOverlay<PaymentApproval>;
  users: EntityOverlay<User>;
}>;

export type FinanceOverlayCollection = keyof FinanceOverlay;

type OverlayEntityMap = {
  accounts: Account;
  balances: BalanceSnapshot;
  beneficiaries: Beneficiary;
  payments: Payment;
  paymentApprovals: PaymentApproval;
  users: User;
};

type OverlayChange<Entity extends { id: string }> =
  | Readonly<{ kind: "create"; record: DeepReadonly<Entity> }>
  | Readonly<{ kind: "update"; id: Entity["id"]; changes: OverlayPatch<Entity> }>
  | Readonly<{ kind: "tombstone"; id: Entity["id"] }>;

export type FinanceOverlayDelta = {
  [Collection in FinanceOverlayCollection]: Readonly<{
    collection: Collection;
    change: OverlayChange<OverlayEntityMap[Collection]>;
  }>;
}[FinanceOverlayCollection];

export type BankEphemeralState = Readonly<{
  baseline: DeepReadonly<FinanceDataset>;
  overlay: FinanceOverlay;
}>;

export type BankEphemeralAction =
  | Readonly<{ type: "apply-overlay-delta"; delta: FinanceOverlayDelta }>
  | Readonly<{ type: "apply-overlay-deltas"; deltas: readonly FinanceOverlayDelta[] }>
  | Readonly<{ type: "reset-overlay" }>;

function createEntityOverlay<Entity extends { id: string }>(): EntityOverlay<Entity> {
  return { created: {}, createdOrder: [], updated: {}, tombstones: {} };
}

export function createInitialFinanceOverlay(): FinanceOverlay {
  return {
    accounts: createEntityOverlay<Account>(),
    balances: createEntityOverlay<BalanceSnapshot>(),
    beneficiaries: createEntityOverlay<Beneficiary>(),
    payments: createEntityOverlay<Payment>(),
    paymentApprovals: createEntityOverlay<PaymentApproval>(),
    users: createEntityOverlay<User>(),
  };
}

export function createBankEphemeralState(
  baseline: DeepReadonly<FinanceDataset>,
): BankEphemeralState {
  return { baseline, overlay: createInitialFinanceOverlay() };
}

export function bankEphemeralReducer(
  state: BankEphemeralState,
  action: BankEphemeralAction,
): BankEphemeralState {
  if (action.type === "reset-overlay") {
    return { baseline: state.baseline, overlay: createInitialFinanceOverlay() };
  }

  if (action.type === "apply-overlay-deltas") {
    return action.deltas.reduce(
      (current, delta) => bankEphemeralReducer(current, { type: "apply-overlay-delta", delta }),
      state,
    );
  }

  const collection = action.delta.collection;
  const current = state.overlay[collection] as EntityOverlay<{ id: string }>;
  const next = applyOverlayChange(current, action.delta.change as OverlayChange<{ id: string }>);

  return {
    baseline: state.baseline,
    overlay: { ...state.overlay, [collection]: next },
  };
}

function applyOverlayChange<Entity extends { id: string }>(
  overlay: EntityOverlay<Entity>,
  change: OverlayChange<Entity>,
): EntityOverlay<Entity> {
  if (change.kind === "create") {
    const id = change.record.id;
    return {
      created: { ...overlay.created, [id]: change.record },
      createdOrder: overlay.created[id]
        ? overlay.createdOrder
        : [...overlay.createdOrder, id],
      updated: withoutKey(overlay.updated, id),
      tombstones: withoutKey(overlay.tombstones, id),
    };
  }

  if (change.kind === "update") {
    const createdRecord = overlay.created[change.id];
    if (createdRecord) {
      return {
        ...overlay,
        created: {
          ...overlay.created,
          [change.id]: { ...createdRecord, ...change.changes },
        },
      };
    }

    return {
      ...overlay,
      updated: {
        ...overlay.updated,
        [change.id]: { ...overlay.updated[change.id], ...change.changes },
      },
    };
  }

  return {
    created: withoutKey(overlay.created, change.id),
    createdOrder: overlay.createdOrder.filter((id) => id !== change.id),
    updated: withoutKey(overlay.updated, change.id),
    tombstones: { ...overlay.tombstones, [change.id]: true },
  };
}

function withoutKey<Value>(
  record: Readonly<Record<string, Value>>,
  key: string,
): Readonly<Record<string, Value>> {
  if (!(key in record)) return record;
  const remaining: Record<string, Value> = { ...record };
  delete remaining[key];
  return remaining;
}
