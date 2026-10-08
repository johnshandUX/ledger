import type {
  Account,
  AccountId,
  BalanceSnapshot,
  BalanceSnapshotId,
  DeepReadonly,
  Payment,
  PaymentApproval,
  PaymentApprovalId,
  PaymentId,
  User,
  UserId,
} from "@johnshandux/ledger-synthetic-finance";
import type { EntityOverlay } from "./ephemeral-state";

type EffectiveEntity = { id: string };
export type EffectiveCollectionSource<Entity extends EffectiveEntity> = Readonly<{
  baseline: readonly DeepReadonly<Entity>[];
  overlay: EntityOverlay<Entity>;
}>;

export function selectEffectiveAccounts(
  source: EffectiveCollectionSource<Account>,
): readonly DeepReadonly<Account>[] {
  return resolveEffectiveCollection(source.baseline, source.overlay);
}

export function selectEffectiveAccountById(
  source: EffectiveCollectionSource<Account>,
  accountId: AccountId,
): DeepReadonly<Account> | undefined {
  return resolveEffectiveRecord(source.baseline, source.overlay, accountId);
}

export function selectEffectiveBalances(
  source: EffectiveCollectionSource<BalanceSnapshot>,
): readonly DeepReadonly<BalanceSnapshot>[] {
  return resolveEffectiveCollection(source.baseline, source.overlay);
}

export function selectEffectiveBalanceById(
  source: EffectiveCollectionSource<BalanceSnapshot>,
  balanceId: BalanceSnapshotId,
): DeepReadonly<BalanceSnapshot> | undefined {
  return resolveEffectiveRecord(source.baseline, source.overlay, balanceId);
}

export function selectEffectivePayments(
  source: EffectiveCollectionSource<Payment>,
): readonly DeepReadonly<Payment>[] {
  return resolveEffectiveCollection(source.baseline, source.overlay);
}

export function selectEffectivePaymentById(
  source: EffectiveCollectionSource<Payment>,
  paymentId: PaymentId,
): DeepReadonly<Payment> | undefined {
  return resolveEffectiveRecord(source.baseline, source.overlay, paymentId);
}

export function selectEffectivePaymentApprovals(
  source: EffectiveCollectionSource<PaymentApproval>,
): readonly DeepReadonly<PaymentApproval>[] {
  return resolveEffectiveCollection(source.baseline, source.overlay);
}

export function selectEffectivePaymentApprovalById(
  source: EffectiveCollectionSource<PaymentApproval>,
  approvalId: PaymentApprovalId,
): DeepReadonly<PaymentApproval> | undefined {
  return resolveEffectiveRecord(source.baseline, source.overlay, approvalId);
}

export function selectEffectiveUsers(
  source: EffectiveCollectionSource<User>,
): readonly DeepReadonly<User>[] {
  return resolveEffectiveCollection(source.baseline, source.overlay);
}

export function selectEffectiveUserById(
  source: EffectiveCollectionSource<User>,
  userId: UserId,
): DeepReadonly<User> | undefined {
  return resolveEffectiveRecord(source.baseline, source.overlay, userId);
}

function resolveEffectiveCollection<Entity extends EffectiveEntity>(
  baseline: readonly DeepReadonly<Entity>[],
  overlay: EntityOverlay<Entity>,
): readonly DeepReadonly<Entity>[] {
  if (isOverlayEmpty(overlay)) return baseline;

  const baselineIds = new Set(baseline.map(({ id }) => id));
  const effectiveBaseline = baseline.flatMap((record) => {
    if (overlay.tombstones[record.id]) return [];
    const source = overlay.created[record.id] ?? record;
    const changes = overlay.updated[record.id];
    return [changes ? mergeChanges(source, changes) : source];
  });
  const appendedCreated = orderedCreatedIds(overlay)
    .filter((id) => !baselineIds.has(id))
    .flatMap((id) => {
      if (overlay.tombstones[id]) return [];
      const source = overlay.created[id];
      if (!source) return [];
      const changes = overlay.updated[id];
      return [changes ? mergeChanges(source, changes) : source];
    });

  return [...effectiveBaseline, ...appendedCreated];
}

function resolveEffectiveRecord<Entity extends EffectiveEntity>(
  baseline: readonly DeepReadonly<Entity>[],
  overlay: EntityOverlay<Entity>,
  id: string,
): DeepReadonly<Entity> | undefined {
  if (overlay.tombstones[id]) return undefined;

  const source = overlay.created[id] ?? baseline.find((record) => record.id === id);
  if (!source) return undefined;

  const changes = overlay.updated[id];
  return changes ? mergeChanges(source, changes) : source;
}

function mergeChanges<Entity extends EffectiveEntity>(
  source: DeepReadonly<Entity>,
  changes: Readonly<Partial<Omit<Entity, "id">>>,
): DeepReadonly<Entity> {
  return { ...source, ...changes, id: source.id } as DeepReadonly<Entity>;
}

function isOverlayEmpty<Entity extends EffectiveEntity>(
  overlay: EntityOverlay<Entity>,
): boolean {
  return Object.keys(overlay.created).length === 0
    && Object.keys(overlay.updated).length === 0
    && Object.keys(overlay.tombstones).length === 0;
}

function orderedCreatedIds<Entity extends EffectiveEntity>(
  overlay: EntityOverlay<Entity>,
): readonly string[] {
  const createdIds = new Set(Object.keys(overlay.created));
  const explicitOrder = overlay.createdOrder.filter((id, index, order) =>
    createdIds.has(id) && order.indexOf(id) === index,
  );
  const orderedIds = new Set(explicitOrder);
  const deterministicFallback = [...createdIds]
    .filter((id) => !orderedIds.has(id))
    .sort((left, right) => left < right ? -1 : left > right ? 1 : 0);

  return [...explicitOrder, ...deterministicFallback];
}
