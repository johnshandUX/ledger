# Payments V2 component mapping

## Layering rule

Payments V2 uses four distinct layers:

| Layer | Owns | Must not own |
| --- | --- | --- |
| Ledger UI primitives | Semantics, generic interaction, token styling and accessibility contracts | Payment eligibility, balances, lifecycle or authorisation |
| Bank-local financial patterns | Account, amount and recipient presentation composed for the journey | Canonical domain rules or Synthetic Finance mutation |
| Bank page compositions | Screen hierarchy, journey navigation, review and confirmation | Reusable primitive contracts or finance invariants |
| Domain operations | Instruction validation, authorisation, status and atomic overlay action | React, focus, layout or storage implementation |

The three proposed financial patterns remain local to Ledger Bank. This task does not promote them, change shared APIs or create design-system variants.

## Existing design-system primitives

| Need | Existing component/convention | Use in Payments V2 |
| --- | --- | --- |
| Primary/secondary actions | `Button` | Continue, Send payment, Schedule payment and modal actions |
| Text/date/reference entry | `Input` | Reference, search and native date input where appropriate; use its label/hint/error relationships |
| Field composition | `FormField` | Consistent field state when compatible with the child control |
| Recurrence choices | `Select` | Native finite-list Repeats and conditional Ends controls in the scheduling dialog |
| Status | `Badge` | Canonical Processing or Scheduled text treatment |
| Informational guidance | `Alert` | Future-balance message or cross-field feedback where inline text is insufficient |
| Loading | `Spinner` | Decorative beside a named submitting label, never as the only accessible content |
| Boundaries | `Separator` or token border | Connected amount and review-detail divisions; prefer decorative separators where no semantic boundary is needed |
| Compact picker surface | `Dialog` | Account/recipient selection when the task remains compact |
| Larger supporting surface | `Sheet` | Mobile or high-volume selection where more viewport space is required |
| Icons | `Icon` entry | Approved account, chevron, search, status and calendar glyphs; decorative icons hidden from assistive technology |
| Navigation | `.ledger-link` with `next/link` | Edit, View payment details and Back to payments |
| Status/error surface | `Alert` | Static information or dynamically announced failure with consumer-owned role |

### Components not to misuse

- `Card` is non-interactive and explicitly prohibits making the whole Card clickable. The approved account card must therefore be a Bank-local semantic button styled as a bounded financial surface.
- `Select` is a native finite-list control and is not the rich searchable account/recipient picker.
- `Popover` is for small contextual interaction, not a large searchable portfolio.
- `AlertDialog` is for consequential confirmation, not the review screen or routine payment submission.
- `Progress` represents measurable operation progress, not `Step n of 3` journey position.

SearchField, Combobox, ListBox, DatePicker, Stepper, ValidationSummary and Result are planned but unpublished in the design-system manifest. Payments V2 must not import or claim those APIs. A local composition may implement the required semantics without establishing a shared public contract.

## Bank-local AccountSelector

### Responsibility

- Render the selected source account as one full-surface button.
- Present name, masked identifier, currency and available balance.
- Open and manage the selection surface.
- Present already-derived eligible options and selection errors.

### Inputs

```ts
type AccountOption = Readonly<{
  id: AccountId;
  name: string;
  maskedIdentifier: string;
  currency: "GBP";
  availableBalanceMinor: number;
  unavailableReason?: string;
}>;
```

The product/domain adapter supplies eligibility and balance values. AccountSelector does not infer eligible account types, read Synthetic Finance directly, compare funds or mutate the amount.

### Composition

- native button trigger;
- approved Ledger Icon;
- token-based boundary, radius, typography and spacing;
- Dialog or Sheet selection surface;
- Input for search if needed;
- local selectable-list semantics;
- `formatMinorCurrencyAmount` for display.

## Bank-local CurrencyAmountInput

### Responsibility

- Preserve the raw editable amount string.
- Display fixed GBP context.
- Present hint and validation messages.
- Compose the connected sending/receiving surface.

It does not calculate exchange rates, select accounts, assess available funds, decide fees or own payment rules.

Suggested controlled boundary:

```ts
type CurrencyAmountInputProps = Readonly<{
  label: string;
  value: string;
  currency: "GBP";
  onValueChange: (value: string) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
}>;
```

Use one editable instance/field for You send. Recipient gets is derived read-only output rather than a second editable instance. Domain parsing returns exact integer minor units; `formatCurrencyAmount` remains a presentation utility, not arithmetic.

## Bank-local RecipientPicker

### Responsibility

- Display the current recipient name and masked bank account details.
- Search eligible existing recipient records.
- Distinguish identical recipient names through masked bank account details.
- Return the selected stable recipient/beneficiary identifier.
- Present selection errors.

Suggested view model:

```ts
type RecipientOption = Readonly<{
  id: BeneficiaryId;
  name: string;
  maskedIdentifier: string;
  currency: "GBP";
  unavailableReason?: string;
}>;
```

One option is one saved payment-destination bank account; there is no separate recipient-to-destinations hierarchy. The customer-facing API and copy use Recipient. The adapter maps the selected recipient record ID to Synthetic Finance's existing `beneficiaryId`.

### Composition

- semantic button trigger;
- Dialog or Sheet;
- labelled Input search;
- keyboard-operable local selection list;
- masked bank account presentation;
- explicit empty/no-results content.

It does not model Contacts, rank recent recipients without a policy or decide recipient eligibility. Recipient creation remains a separate repeatable payment task backed by a named EDS-001 operation when implemented.

## Future recipient groups and management

Recipient groups are product-owned records containing stable recipient IDs. Membership is optional and many-to-many. Groups do not contain amounts and are not payment templates. A future Multiple-mode selector may compose the existing search/input, selection-surface and control primitives to preserve selected IDs across directory search and group filtering.

Optional group assignment during **Add recipient** should eventually use a searchable multi-select composition, but this handoff does not approve a new design-system component. A future Recipients Manager owns adding, editing and removing recipient accounts and creating, renaming, removing and assigning groups. These capabilities are outside the current Payments V2 implementation.

## Page-level compositions

- **Payment journey frame:** progress text, constrained content region and step navigation.
- **Amount surface:** CurrencyAmountInput plus derived receiving output within one local surface.
- **Payment summary:** compact Step 2 context using resolved account and amount data.
- **Review summary:** amount surface, vertically grouped details and contextual Edit actions.
- **Confirmation result:** local composition of Icon, heading, amount, Recipient, Badge, detail list and navigation actions.

These are Ledger Bank product compositions. Do not publish them as generic components merely because more than one screen uses their styling.

## Domain-operation boundary

The payment submission operation accepts explicit acting context and a typed instruction. It:

- resolves Amelia Hart exactly;
- verifies business membership, active status and `payments:create`;
- applies the Amelia-only independent-authorisation policy;
- validates account, amount, funds, currency, recipient record, reference and timing;
- returns `processing` or `scheduled`;
- returns one atomic payment-overlay action or structured errors.

No UI component may dispatch arbitrary finance deltas, construct approval actions, debit balances or infer lifecycle state.
