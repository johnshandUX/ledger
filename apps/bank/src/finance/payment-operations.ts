import type {
  Account,
  BalanceSnapshot,
  Beneficiary,
  DeepReadonly,
  FinanceDataset,
  Payment,
  User,
} from "@johnshandux/ledger-synthetic-finance";
import type { FinanceOverlayDelta } from "../state/ephemeral-state";

export const PAYMENTS_V2_ACTING_USER_ID = "user-amelia-hart";

export type SubmitPaymentCommand = Readonly<{
  id: string;
  businessId: string;
  actingUserId: string;
  sourceAccountId: string;
  amountMinor: number;
  currency: "GBP";
  reference: string;
  execution:
    | Readonly<{ kind: "immediate" }>
    | Readonly<{ kind: "scheduled"; date: string }>;
  recipient:
    | Readonly<{ kind: "existing"; beneficiaryId: string }>
    | Readonly<{ kind: "new"; beneficiary: Beneficiary }>;
}>;

export type PaymentOperationErrorCode =
  | "actor-not-found"
  | "actor-inactive"
  | "actor-business-mismatch"
  | "payment-create-not-permitted"
  | "independent-submission-not-authorised"
  | "duplicate-payment-id"
  | "account-not-found"
  | "account-not-eligible"
  | "unsupported-currency"
  | "invalid-amount"
  | "insufficient-available-funds"
  | "recipient-not-found"
  | "recipient-business-mismatch"
  | "unsupported-recipient-currency"
  | "invalid-reference"
  | "invalid-scheduled-date";

export type PaymentOperationError = Readonly<{
  code: PaymentOperationErrorCode;
  field?: "amount" | "account" | "recipient" | "reference" | "date";
  message: string;
}>;

export type SubmitPaymentState = Readonly<{
  baseline: DeepReadonly<FinanceDataset>;
  accounts: readonly DeepReadonly<Account>[];
  balances: readonly DeepReadonly<BalanceSnapshot>[];
  beneficiaries: readonly DeepReadonly<Beneficiary>[];
  payments: readonly DeepReadonly<Payment>[];
  users: readonly DeepReadonly<User>[];
}>;

export type SubmitPaymentResult =
  | Readonly<{
      ok: true;
      payment: Payment;
      beneficiary?: Beneficiary;
      deltas: readonly FinanceOverlayDelta[];
    }>
  | Readonly<{ ok: false; errors: readonly PaymentOperationError[] }>;

export function submitPaymentInstruction(
  command: SubmitPaymentCommand,
  state: SubmitPaymentState,
  now: string,
): SubmitPaymentResult {
  const errors: PaymentOperationError[] = [];
  const actor = state.users.find(({ id }) => id === command.actingUserId);
  if (!actor) {
    errors.push({ code: "actor-not-found", message: "The acting user could not be found." });
  } else {
    if (actor.status !== "active") errors.push({ code: "actor-inactive", message: "The acting user is not active." });
    if (actor.businessId !== command.businessId) errors.push({ code: "actor-business-mismatch", message: "The acting user does not belong to this business." });
    const rolePermissionIds = new Set(state.baseline.roles
      .filter(({ id, businessId }) => actor.roleIds.includes(id) && businessId === command.businessId)
      .flatMap(({ permissionIds }) => permissionIds));
    const canCreate = state.baseline.permissions.some(({ id, key }) =>
      rolePermissionIds.has(id) && key === "payments:create",
    );
    if (!canCreate) errors.push({ code: "payment-create-not-permitted", message: "The acting user cannot create payments." });
    if (actor.id !== PAYMENTS_V2_ACTING_USER_ID) errors.push({ code: "independent-submission-not-authorised", message: "The acting user is not authorised to submit independently." });
  }

  if (state.payments.some(({ id }) => id === command.id)) {
    errors.push({ code: "duplicate-payment-id", message: "This payment has already been submitted." });
  }
  const account = state.accounts.find(({ id }) => id === command.sourceAccountId);
  if (!account || account.businessId !== command.businessId) {
    errors.push({ code: "account-not-found", field: "account", message: "Choose an available account." });
  } else {
    if (account.status !== "active" || account.accountType !== "current") errors.push({ code: "account-not-eligible", field: "account", message: "This account cannot be used for the payment." });
    if (account.currency !== "GBP" || command.currency !== "GBP") errors.push({ code: "unsupported-currency", field: "account", message: "Only GBP payments are supported." });
  }
  if (!Number.isSafeInteger(command.amountMinor) || command.amountMinor <= 0) {
    errors.push({ code: "invalid-amount", field: "amount", message: "Enter a valid GBP amount." });
  } else if (account) {
    const balance = latestBalance(state.balances, account.id);
    if (!balance || balance.currency !== "GBP" || command.amountMinor > balance.availableBalanceMinor) {
      errors.push({ code: "insufficient-available-funds", field: "amount", message: "The amount is higher than this account’s available balance." });
    }
  }

  const existingBeneficiaryId = command.recipient.kind === "existing"
    ? command.recipient.beneficiaryId
    : undefined;
  const beneficiary = existingBeneficiaryId
    ? state.beneficiaries.find(({ id }) => id === existingBeneficiaryId)
    : command.recipient.kind === "new" ? command.recipient.beneficiary : undefined;
  if (!beneficiary) errors.push({ code: "recipient-not-found", field: "recipient", message: "Choose a recipient." });
  else {
    if (beneficiary.businessId !== command.businessId) errors.push({ code: "recipient-business-mismatch", field: "recipient", message: "This recipient is unavailable." });
    if (beneficiary.currency !== "GBP") errors.push({ code: "unsupported-recipient-currency", field: "recipient", message: "Only GBP recipient destinations are supported." });
  }
  if (!command.reference.trim()) errors.push({ code: "invalid-reference", field: "reference", message: "Enter a payment reference." });
  if (command.execution.kind === "scheduled" && !isFutureIsoDate(command.execution.date, now)) {
    errors.push({ code: "invalid-scheduled-date", field: "date", message: "Choose a valid future payment date." });
  }
  if (errors.length || !beneficiary) return { ok: false, errors };

  const payment: Payment = {
    id: command.id,
    businessId: command.businessId,
    sourceAccountId: command.sourceAccountId,
    beneficiaryId: beneficiary.id,
    amountMinor: command.amountMinor,
    currency: command.currency,
    reference: command.reference.trim(),
    status: command.execution.kind === "immediate" ? "processing" : "scheduled",
    createdByUserId: command.actingUserId,
    createdAt: now,
    ...(command.execution.kind === "scheduled" ? { scheduledFor: command.execution.date } : {}),
  };
  const deltas: FinanceOverlayDelta[] = [];
  if (command.recipient.kind === "new") {
    deltas.push({ collection: "beneficiaries", change: { kind: "create", record: beneficiary } });
  }
  deltas.push({ collection: "payments", change: { kind: "create", record: payment } });
  return { ok: true, payment, beneficiary: command.recipient.kind === "new" ? beneficiary : undefined, deltas };
}

function latestBalance(balances: readonly DeepReadonly<BalanceSnapshot>[], accountId: string) {
  return balances.filter(({ accountId: id }) => id === accountId)
    .reduce<DeepReadonly<BalanceSnapshot> | undefined>((latest, balance) =>
      !latest || balance.asOf > latest.asOf ? balance : latest, undefined);
}

function isFutureIsoDate(value: string, now: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false;
  return value > now.slice(0, 10);
}
