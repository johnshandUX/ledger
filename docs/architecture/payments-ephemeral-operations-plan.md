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

For Ledger Bank product language, one Synthetic Finance `Beneficiary` represents one saved **Recipient** payment-destination bank account. Its stable `BeneficiaryId`, display name and bank account fields are sufficient for the approved recipient model. Identical names may occur on separate records with different accounts. No separate Contact, person, organisation, supplier or recipient-to-multiple-destinations entity is required.

Future recipient groups are optional Bank-owned collections of stable recipient IDs. Membership is many-to-many: a recipient may belong to zero, one or multiple groups and remains independently available in the complete directory. Removing membership never deletes the recipient. Groups do not store amounts and are not payment templates. Group creation and management remain a separate future capability and do not change the minimum payment-submission operation described here.

A future Recipients Manager must preserve historical payment information after a recipient is edited or removed. The current `Payment` contract stores `beneficiaryId` rather than a recipient snapshot, so that future capability requires an explicit history-preservation decision—such as immutable versioning, tombstoning or payment-time presentation snapshots—before implementation. This handoff does not choose that mechanism or change the current payment contract.

### Existing validation

`validateFinanceDataset()` provides dataset-level referential checks: unique identifiers, safe-integer monetary values, existing business/account/beneficiary/user relationships, matching business ownership, matching account and beneficiary currency, and valid payment/approval references. It does not validate positive amounts, account eligibility, available funds, permissions, duplicate submissions, execution dates, approval policy, status/date coherence or lifecycle transitions.

### Product experience and rendering

- `/payments` is a read-only Server Component that obtains baseline payment rows and summaries through `src/finance/payments.ts`.
- `/payments/[paymentId]` is a read-only Server Component that resolves baseline account, beneficiary, creator and approval relationships and calls `notFound()` for an unknown baseline identifier.
- `PaymentsDataTable` is a Client Component for table sorting and responsive presentation only. It receives server-produced rows and does not read application state.
- The Bank home/accounts overview shows a “Make a payment” button, but there is no payment form, submission route, confirmation journey or mutation handler.
- Payment and approval summaries use Synthetic Finance calculations over the baseline `FinanceDataset`.
- Effective-state selectors and hooks now exist for payments, approvals, accounts, balances and users. Beneficiaries remain immutable baseline recipient records, which is sufficient until the approved add-recipient loop or Recipients Manager becomes an implementation feature.

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

`submitPaymentInstruction(command, effectiveState, context, dependencies)` authorises the acting user, validates the complete command and returns either typed domain errors or one atomic application-state action containing the payment. It never dispatches sequential deltas, creates approval records, changes balances, reserves funds or creates a transaction.

`context` is trusted application context rather than form input and supplies the acting business and user. The operation derives `businessId` and `createdByUserId` from that context before checking permissions. Form callers must never choose an arbitrary actor identifier.

### Payments 1A acting administrator

Payments 1A uses the existing configured Ledger Bank demo identity, Amelia Hart (`user-amelia-hart`), as the only independently authorised submitter:

- Amelia is an active user belonging to `business-caldermere`.
- Her existing role is `role-finance-leadership` (`Finance Leadership`).
- That role includes `permission-payments-create` (`payments:create`) and `permission-payments-approve` (`payments:approve`), as well as `permission-administration-view`.
- Ledger Bank already identifies her explicitly through `BANK_DEMO_USER_ID`; the operation must accept or resolve that trusted identity rather than select the first user or infer authority from collection order.

The Synthetic Finance data does not contain an “administrator” flag or an independent-submission policy. Amelia's permission to create payments is grounded in the existing role relationship; her authority to submit without secondary approval is the approved Payments 1A product policy and applies only when `actorUserId === "user-amelia-hart"`. The `Business Administration` role name is not a substitute for this policy: its existing users do not have `payments:create`.

The operation receives explicit dependencies for the current instant, business date and payment-authorisation policy. The `paymentId` is supplied as a deterministic unique submission identifier. The proposed minimum behavior is duplicate rejection: if the identifier already exists in effective payments, the operation returns a typed `duplicate-payment-id` error and makes no change. It does not report an existing record as a successful replay. A genuinely separate payment with a new identifier but identical commercial details may still be valid.

No separate `createDraft`, `approve`, `reject`, `cancel` or `execute` command is required until an approved product journey needs it.

## Proposed validation

The submit operation should accumulate field/domain errors without changing state and enforce:

1. The payment identifier does not already exist in effective payments.
2. The business, creator, source account and beneficiary exist and belong to the same business.
3. The trusted context actor resolves to `user-amelia-hart`, is active, belongs to the context business and has `payments:create` through the effective `role-finance-leadership` relationship. A missing, inactive, cross-business, unpermitted or differently identified actor is rejected with a structured authorisation error and no state change.
4. The source account is active and eligible for outgoing payments; closed accounts are rejected. Treatment of restricted accounts requires product approval.
5. Amount is a positive safe integer in minor units.
6. Currency matches both source account and beneficiary.
7. The latest effective balance snapshot at or before the dependency’s explicit current instant exists, matches the account currency and has sufficient available funds. Snapshot selection sorts by `asOf` deterministically and ignores future snapshots.
8. Reference is trimmed, non-empty and within an approved length.
9. A scheduled date is a valid ISO date and is later than the explicit business date; same-day instructions use `immediate`.

The existing dataset validator can remain a supporting invariant check in tests, but it is not the command validator and should not be made responsible for application workflow.

Authorisation is evaluated separately from instruction validation. The initial policy can remain a small explicit function or dependency that answers whether this actor may submit this instruction independently. It should return an authorisation outcome such as `independent-submission` or a structured error such as `actor-not-found`, `actor-inactive`, `actor-business-mismatch`, `payment-create-not-permitted` or `independent-submission-not-authorised`. Amount, account, balance, currency, beneficiary, reference and execution-date validation remains unchanged and must not be used as a proxy for authorisation.

This policy boundary is the extension point for later business rules. A future approved capability may return `approval-required` with its required approver policy instead, but Payments 1A needs only the independently authorised outcome for Amelia and a rejected outcome for every other actor. It does not require a generic policy engine, threshold framework or new approval infrastructure.

## Submission and lifecycle semantics

Submission records an instruction; it does not mean settlement or execution.

- For the authorised Payments 1A administrator, a future-dated instruction is created as `scheduled`.
- For the authorised Payments 1A administrator, an immediate instruction is created as `processing`.
- No monetary approval threshold applies, no secondary approver is required and no pending approval action is created.
- Never create a submitted instruction directly as `completed`.
- Do not create a transaction, change ledger/available balances or reserve funds in this first increment. Those effects belong to a separately defined execution capability or an explicitly approved reservation model.
- A scheduled instruction is represented accurately but is not executed by a background job under EDS-001.

The existing `PaymentApproval` model, approval selectors, calculations and historical Caldermere approval records remain unchanged. The no-secondary-approval rule applies only to new Payments 1A submissions by Amelia; it does not reinterpret or simplify existing `awaiting-approval` payments.

A successful result should expose the payment identifier, reference, status and scheduled date where applicable so the product can show a deterministic confirmation and link to detail. A rejected result contains typed, presentable error codes without partial overlay changes.

## Atomic state transition

Payments 1A creates one payment record and no approval records, transactions, balance updates or reservations. The existing single-collection overlay action is therefore sufficient for its atomic transition: the named operation validates and authorises first, then returns one payment creation action, or returns errors and no action. A shared batch/transaction action is not required for this increment. Future approval-required operations may justify one when they have an approved multi-record transition.

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

Define the typed command, dependency interfaces, domain result/error union and the single payment-creation overlay action. Keep all validation and operation code in framework-independent Bank modules.

### 3. Implement submission domain tests

Cover successful immediate and scheduled outcomes for Amelia; authorisation rejection for every other actor; every validation failure; typed repeat-submission rejection; baseline immutability; deterministic clock/IDs; and proof that no approval, transaction, balance or reservation record is created.

### 4. Add effective Payments read models

Compose effective records into the existing overview/detail shapes and calculate effective summaries without mutating or duplicating Synthetic Finance data.

### 5. Add the smallest product boundary

Introduce a focused client payment form and confirmation, connect the existing entry action, and migrate only the overview/detail content that must observe the overlay. Preserve the existing visual and navigation structure unless separately designed.

### 6. Verify the journey

Test valid and invalid submission, double-submit protection, atomic state, overview/detail consistency across `next/link` navigation, reload reset, independent instances, baseline immutability and absence of persistence. Run a real-browser journey in addition to unit and integration tests.

## Required test coverage

- **Unit:** independent authorisation and instruction validation; exact Amelia identity, business, active status and `payments:create` permission; unauthorised actor outcomes; immediate/scheduled status selection; deterministic identifiers/times; duplicate payment ID; shallow domain errors; and no input mutation.
- **Reducer:** one payment creation transition, immutable collection updates, reset, and no approval, transaction, balance or reservation deltas.
- **Integration:** form invokes the named operation; valid results update overview, summaries and detail; invalid results leave effective state unchanged; unrelated collections retain references where possible.
- **Browser:** submit immediate and scheduled examples, prevent repeat submission, navigate overview → detail while retaining the record, reload to baseline, and verify a separate context starts from baseline with no console/hydration errors.
- **Architecture audits:** original Synthetic Finance records remain deeply equal, feature code does not dispatch raw overlay deltas, and no storage/API persistence is introduced.

## Product decisions requiring approval

The acting identity and initial approval policy are approved: Amelia Hart (`user-amelia-hart`) is the sole Payments 1A independently authorised submitter; immediate payments enter `processing`; future-dated payments enter `scheduled`; and the operation creates no approval actions, transactions, balance deductions or fund reservations.

1. **Restricted accounts:** Whether outgoing payment submission is prohibited or conditionally allowed.
2. **Duplicate semantics:** Approve typed rejection of an existing `paymentId` as the minimum repeat-submission protection while allowing intentionally repeated commercial details under a new ID. True idempotent replay or fingerprint/time-window blocking would require a different result/storage contract.
3. **Reference contract:** Maximum length and permitted characters.
4. **Scheduling:** Confirm that today means immediate and future dates mean scheduled; define weekends/holidays only if the product needs them.
5. **Confirmation:** Approve the confirmation content and destination—recommended: reference, amount, recipient, status, execution date and a link to the effective detail route.

Approval/rejection, cancellation, execution, transaction creation and balance booking should each be proposed as later named operations only when an approved product journey requires them.
