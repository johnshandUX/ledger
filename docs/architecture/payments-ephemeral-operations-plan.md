# Payments ephemeral operations plan

- **Status:** Proposed for product and architecture approval
- **Architecture:** [EDS-001: Ephemeral Demo State](EDS-001-ephemeral-demo-state.md)
- **Implementation model:** [Feature-driven domain operations](EDS-001-ephemeral-demo-state.md#feature-driven-domain-operations)

## Purpose

This document assesses the current Ledger Bank Payments experience and proposes the minimum first feature increment. It is a plan, not an implemented operation or an instruction to build a complete payments engine.

## Current implementation

### Domain contracts

Synthetic Finance defines `Payment` with a source account, beneficiary, integer minor-unit amount, currency, reference, creator and creation time. The supported statuses are `draft`, `awaiting-approval`, `scheduled`, `processing`, `completed`, `failed` and `cancelled`. Optional dates record scheduling and terminal outcomes.

`PaymentApproval` links a payment to an approver and has `pending`, `approved` or `rejected` status plus creation and optional action times. Roles expose `payments:create` and `payments:approve` permissions. These contracts describe records; they do not define approval thresholds, required approver counts, self-approval rules or lifecycle transitions.

Payments refer to a business, source account, beneficiary and creating user. Accounts have business, legal-entity, currency and status relationships. Balance snapshots provide ledger and available balances for an account and currency. No reservation, hold or scheduled-execution entity exists.

### Existing validation

`validateFinanceDataset()` provides dataset-level referential checks: unique identifiers, safe-integer monetary values, existing business/account/beneficiary/user relationships, matching business ownership, matching account and beneficiary currency, and valid payment/approval references. It does not validate positive amounts, account eligibility, available funds, permissions, duplicate submissions, execution dates, approval policy, status/date coherence or lifecycle transitions.

### Product experience and rendering

- `/payments` is a read-only Server Component that obtains baseline payment rows and summaries through `src/finance/payments.ts`.
- `/payments/[paymentId]` is a read-only Server Component that resolves baseline account, beneficiary, creator and approval relationships and calls `notFound()` for an unknown baseline identifier.
- `PaymentsDataTable` is a Client Component for table sorting and responsive presentation only. It receives server-produced rows and does not read application state.
- The Bank home/accounts overview shows a “Make a payment” button, but there is no payment form, submission route, confirmation journey or mutation handler.
- Payment and approval summaries use Synthetic Finance calculations over the baseline `FinanceDataset`.
- Effective-state selectors and hooks now exist for payments, approvals, accounts, balances and users. Beneficiaries remain immutable baseline records, which is sufficient until beneficiary management becomes a feature.

Consequently, a created ephemeral payment cannot yet appear in the overview or detail journey. Server Components cannot observe the client overlay, and the detail route currently rejects identifiers that exist only in that overlay.

## Minimum first operation

The first feature should introduce one mutation operation:

```ts
type SubmitPaymentInstructionCommand = Readonly<{
  paymentId: PaymentId;
  sourceAccountId: AccountId;
  beneficiaryId: BeneficiaryId;
  amountMinor: MinorUnitAmount;
  currency: CurrencyCode;
  reference: string;
  execution: { kind: "immediate" } | { kind: "scheduled"; date: IsoDate };
}>;

type PaymentOperationContext = Readonly<{
  businessId: BusinessId;
  actorUserId: UserId;
}>;
```

`submitPaymentInstruction(command, effectiveState, context, dependencies)` validates the complete command and returns either typed domain errors or one atomic application-state action containing the payment and any required approval records. It never dispatches sequential deltas and never changes balances or creates a transaction.

`context` is trusted application context rather than form input and supplies the acting business and user. The operation derives `businessId` and `createdByUserId` from that context before checking permissions. Ledger Bank has no authentication today, so product implementation must first approve whether the trusted actor is the fixed Amelia Hart demo identity or a future simulated user-selection mechanism; form callers must never choose an arbitrary actor identifier.

The operation receives explicit dependencies for the current instant, business date and approval policy. Identifiers are supplied deterministically: `paymentId` is a unique submission identifier, while any approval identifiers come from an injected deterministic identifier source. The proposed minimum behavior is duplicate rejection: if the identifier already exists in effective payments, the operation returns a typed `duplicate-payment-id` error and makes no change. It does not report an existing record as a successful replay. A genuinely separate payment with a new identifier but identical commercial details may still be valid.

No separate `createDraft`, `approve`, `reject`, `cancel` or `execute` command is required until an approved product journey needs it.

## Proposed validation

The submit operation should accumulate field/domain errors without changing state and enforce:

1. The payment identifier does not already exist in effective payments.
2. The business, creator, source account and beneficiary exist and belong to the same business.
3. The trusted context actor is active, belongs to the context business and has `payments:create` through an effective role/permission relationship.
4. The source account is active and eligible for outgoing payments; closed accounts are rejected. Treatment of restricted accounts requires product approval.
5. Amount is a positive safe integer in minor units.
6. Currency matches both source account and beneficiary.
7. The latest effective balance snapshot at or before the dependency’s explicit current instant exists, matches the account currency and has sufficient available funds. Snapshot selection sorts by `asOf` deterministically and ignores future snapshots.
8. Reference is trimmed, non-empty and within an approved length.
9. A scheduled date is a valid ISO date and is later than the explicit business date; same-day instructions use `immediate`.
10. Any approval records reference active, permitted approvers in the same business and follow the approved self-approval rule.

The existing dataset validator can remain a supporting invariant check in tests, but it is not the command validator and should not be made responsible for application workflow.

## Submission and lifecycle semantics

Submission records an instruction; it does not mean settlement or execution.

- If approval is required, create the payment as `awaiting-approval`, retain any future `scheduledFor` date, and create all required pending approval records atomically.
- If approval is not required and execution is future-dated, create it as `scheduled`.
- If approval is not required and execution is immediate, create it as `processing`.
- Never create a submitted instruction directly as `completed`.
- Do not create a transaction or change ledger/available balances in this first increment. Those effects belong to a separately defined execution capability or an explicitly approved reservation model.
- A scheduled instruction is represented accurately but is not executed by a background job under EDS-001.

A successful result should expose the payment identifier, reference, status and scheduled date where applicable so the product can show a deterministic confirmation and link to detail. A rejected result contains typed, presentable error codes without partial overlay changes.

## Atomic state transition

The Phase 1 reducer currently accepts a single collection delta. Before payment submission can create both a payment and approvals, application-state infrastructure needs one batch/transaction action that applies a prevalidated readonly list of typed deltas in one reducer call. The named domain operation—not the feature component—constructs this action. Reducer tests must prove that consumers never observe an intermediate payment-without-approvals state.

The batch mechanism is shared infrastructure justified by this first real multi-record operation. It must not become a generic finance workflow engine or perform domain validation itself.

## Effective-state integration

Payments need a Bank-owned read-model adapter that composes effective payments and approvals with effective accounts/users and immutable beneficiaries. It should preserve existing `BankPayment` and `BankPaymentDetail` presentation contracts where practical, apply the existing explicit newest-first payment ordering, and derive summaries from effective records using pure functions. Existing Synthetic Finance calculations may be reused through a shallow effective dataset view that replaces only the five overlay-backed collections and retains unchanged baseline collection references; this must not become a second stored dataset.

The intended UI boundary is:

- Keep route files as Server Components for route parameters, metadata and static shell composition.
- Add focused Client Components inside the provider for the payment overview/list, submission form/confirmation and effective payment detail.
- Do not expect the server adapter to observe the client overlay.
- Change the dynamic detail page so its client descendant can resolve an overlay-only payment; the Server Component must not call `notFound()` solely because the identifier is absent from baseline.
- Reuse `PaymentsDataTable` as presentation rather than moving merge or mutation logic into it.

This introduces one effective client-side source for interactive Payments while baseline-only server content can remain unchanged until it depends on mutations.

## Incremental implementation sequence

### 1. Approve product rules

Resolve the decisions below and write the submission contract and examples before code changes.

### 2. Add operation and atomic action contracts

Define the typed command, dependency interfaces, domain result/error union and the reducer’s single-dispatch batch action. Keep all validation and operation code in framework-independent Bank modules.

### 3. Implement submission domain tests

Cover successful immediate, scheduled and approval-required outcomes; every validation failure; typed repeat-submission rejection; baseline immutability; deterministic clock/IDs; and all-or-none payment/approval creation.

### 4. Add effective Payments read models

Compose effective records into the existing overview/detail shapes and calculate effective summaries without mutating or duplicating Synthetic Finance data.

### 5. Add the smallest product boundary

Introduce a focused client payment form and confirmation, connect the existing entry action, and migrate only the overview/detail content that must observe the overlay. Preserve the existing visual and navigation structure unless separately designed.

### 6. Verify the journey

Test valid and invalid submission, double-submit protection, atomic state, overview/detail consistency across `next/link` navigation, reload reset, independent instances, baseline immutability and absence of persistence. Run a real-browser journey in addition to unit and integration tests.

## Required test coverage

- **Unit:** command validation, policy outcomes, status selection, deterministic identifiers/times, duplicate payment ID, shallow domain errors and no input mutation.
- **Reducer:** one batch transition, immutable collection updates, reset, and no intermediate observable state.
- **Integration:** form invokes the named operation; valid results update overview, summaries and detail; invalid results leave effective state unchanged; unrelated collections retain references where possible.
- **Browser:** submit immediate and scheduled examples, prevent repeat submission, navigate overview → detail while retaining the record, reload to baseline, and verify a separate context starts from baseline with no console/hydration errors.
- **Architecture audits:** original Synthetic Finance records remain deeply equal, feature code does not dispatch raw overlay deltas, and no storage/API persistence is introduced.

## Product decisions requiring approval

1. **Acting identity:** Approve the trusted actor source. The minimum demo recommendation is the configured Amelia Hart identity supplied by application context, never by form input; a user switcher would be a separate product capability.
2. **Approval policy:** Which amounts, accounts or users require approval; how many approvals; which roles qualify; and whether the creator may approve. Existing fixtures demonstrate approvals but do not define the rule.
3. **Initial lifecycle status:** Approve the proposed submission mapping: approval-required → `awaiting-approval`, future without approval → `scheduled`, and immediate without approval → `processing`. Submission never means `completed`.
4. **Restricted accounts:** Whether outgoing payment submission is prohibited or conditionally allowed.
5. **Funds treatment:** Confirm that submission checks the latest effective balance at or before the explicit current instant but does not reserve or deduct funds. If reservations are required, define their representation and effect on available balance first.
6. **Duplicate semantics:** Approve typed rejection of an existing `paymentId` as the minimum repeat-submission protection while allowing intentionally repeated commercial details under a new ID. True idempotent replay or fingerprint/time-window blocking would require a different result/storage contract.
7. **Reference contract:** Maximum length and permitted characters.
8. **Scheduling:** Confirm that today means immediate and future dates mean scheduled; define weekends/holidays only if the product needs them.
9. **Initial UX scope:** Confirm whether the first feature submits directly or also needs save-draft, review and edit steps. The minimum recommendation is direct submission with review-before-submit in the form, not a persistent draft operation.
10. **Confirmation:** Approve the confirmation content and destination—recommended: reference, amount, beneficiary, status, execution date and a link to the effective detail route.

Approval/rejection, cancellation, execution, transaction creation and balance booking should each be proposed as later named operations only when an approved product journey requires them.
