# Payments V2 UX specification

## Design intent

The journey is a focused, single-column task within the existing Ledger Bank product shell. It should feel conversational and calm while retaining the authority and information density of a commercial banking product.

Use:

- concise headings;
- generous spacing between decisions;
- subtle boundaries and tonal surfaces;
- prominent financial amounts with tabular numerals;
- muted labels and secondary identifiers;
- explicit interactive affordances;
- existing Ledger semantic colour, spacing, radius, type, border and elevation tokens.

Do not introduce decorative illustrations, a parallel visual language, unsupported features or unrelated navigation. Desktop content should use a comfortable task width rather than stretch across the full page. Mobile preserves the same content, order, financial meaning and actions.

## Shared journey frame

The three task screens share:

- the existing `ProductShell` and Payments navigation context;
- a constrained single-column content region;
- a visible progress statement in the form `Step n of 3`;
- one page-level `h1` using the approved title;
- primary progression at the end of the content;
- native browser and Next.js navigation semantics where applicable.

The progress statement communicates position; it is not a new shared Stepper component. Confirmation omits step progress because it is the result of the journey.

## Screen 1: How much?

### Required order

1. `Step 1 of 3`.
2. Page title: **How much?**
3. **From account** label.
4. Interactive source-account card.
5. Connected sending/receiving amount surface.
6. Primary **Continue** action.

### Source-account card

The complete visible card is one semantic button. It is a Bank-local financial pattern, not an interactive use of the design-system `Card`, whose contract is non-interactive.

Content order:

1. Top row: account icon, account name and chevron.
2. Masked account identifier.
3. Subtle divider.
4. **Available balance** label.
5. Prominent formatted balance and currency context.
6. Explicit **Change account** affordance.

The financial identity and balance must be easier to scan than the interaction label. The surface uses existing Ledger radius, boundary, focus and tonal tokens. It needs default, hover, focus-visible, pressed and selected/current states without layout movement. Focus must be visible in light and dark appearances.

Activating it opens an account selection surface showing eligible GBP accounts, masked identifiers and available balances. Ineligible accounts must not appear selectable. Whether they are omitted or shown with a domain-backed reason is a flexible implementation detail, provided no unsupported account looks executable.

Changing accounts preserves the raw entered amount and immediately revalidates it. The journey must not silently convert, round or clear it.

### Connected amount surface

The sending and receiving sections read as one composed surface.

Top section:

- label: **You send**;
- fixed GBP currency identifier;
- large editable monetary amount.

Divider.

Bottom section:

- label: **Recipient gets**;
- fixed GBP currency identifier;
- large read-only derived amount.

For V2, the receiving amount mirrors the valid sending amount when the domain confirms no conversion, fee or recipient-side deduction. The receiving presentation is output, not a second editable field. GBP is not presented as a menu containing unsupported currencies.

Both amounts use aligned tabular numerals. Empty, incomplete or invalid raw input must not be reformatted destructively while the user is typing. Domain values use integer minor units after exact parsing.

### Continue behaviour

Continue validates the fields needed to leave this screen. Errors appear next to their relevant control and in an accessible summary when multiple errors require attention. A validation failure does not discard either the account or raw amount.

## Screen 2: Sending to

### Required order

1. `Step 2 of 3`.
2. Page title: **Sending to**
3. Compact summary of the sending amount and source account.
4. Payment timing section.
5. Recipient section.
6. Payment reference.
7. Primary **Continue** action.

The compact summary is review context, not a second editable amount surface. It may provide an Edit action returning to Step 1.

### Timing

Immediate processing is the default. The amount screen shows the current timing summary and a **Schedule** or **Change** action that opens a focused scheduling dialog.

The dialog uses progressively disclosed native controls:

- a labelled payment date input;
- a labelled **Repeats** Select with Never (default), Weekly, Fortnightly, Monthly, Quarterly and Annually;
- for a repeating schedule, a labelled **Ends** Select with Never (default) and On a specific date;
- for a specific end, a labelled End date input that must not be earlier than the payment date.

Returning Repeats to Never hides Ends and End date. Cancel restores the last confirmed schedule draft, while **Send as soon as possible** removes it. The amount screen presents the confirmed schedule as readable text. Apply only the approved valid-date policy.

For a future date, show a static informational message explaining that available balance may change before the payment is processed. Do not show projected balance, completion estimate, arrival date or an implied future background execution.

### Recipient

Heading: **Who are you sending it to?**

The visible control displays:

- recipient name;
- masked bank account details;
- a clear selection/change affordance.

Activating it opens a searchable selection surface. Each option is one recipient record representing one saved payment-destination bank account. Selection resolves that stable recipient record ID. Identical display names remain separate options when their bank account details differ.

No separate person, organisation, supplier or Contact relationship is required, and no recipient-to-multiple-destinations hierarchy is introduced. All customer-facing copy uses **Recipient**. The existing Synthetic Finance `Beneficiary` name may remain inside domain adapters and code.

### Multiple-recipient selection

The Multiple mode recipient-selection stage must:

1. Search and browse the complete recipient directory.
2. Filter or select recipients through optional groups.
3. Select multiple individual recipient records.
4. Preserve selections across searching and group filtering.
5. Display the selected-recipient count and a clear selection summary.
6. Continue to individual amount allocation without assigning or calculating a group amount.

Recipient rows primarily show the recipient name, masked bank account details and selection control. Group badges are not required beside every recipient. Every recipient remains available in the complete directory whether it belongs to zero, one or multiple groups.

### Add-recipient loop

The recipient-selection stage supports this repeatable future task:

1. Select **Add recipient**.
2. Enter the recipient name and supported bank account details.
3. Optionally assign the recipient to existing groups.
4. When implemented, validate and add the recipient through EDS-001.
5. Return to the recipient-selection list.
6. Automatically select the newly created recipient.
7. Preserve every existing recipient selection and all payment draft data.
8. Allow the customer to repeat the task.

Group assignment should eventually use a searchable multi-select pattern. This requirement does not create or approve a new design-system component. Creating and managing groups is a separate future capability.

### Future Recipients Manager

A future Recipients Manager may add, edit and remove recipient accounts; manage optional group membership; and create, rename or remove recipient groups. It is outside the current Payments V2 implementation. Historical payment information must remain intact if a recipient is later edited or removed; historical records must not depend on mutable current recipient presentation.

### Payment reference

Label: **Payment reference**.

Use a concise illustrative placeholder such as `e.g. INV-12345`; a placeholder is not a validation rule. Apply only the approved reference policy. Keep the visible label at all times, and associate hint and error text with the control.

## Screen 3: Review payment

### Required order

1. `Step 3 of 3`.
2. Page title: **Review payment**.
3. Prominent amount summary.
4. Vertically grouped payment details.
5. Fees and total debit only when supported by domain data.
6. Primary submission action.

### Amount summary

Use a subtle tonal or approved elevated surface containing:

- **You’re sending**;
- prominent GBP amount;
- receiving amount where it adds clarity;
- explicit GBP context.

Do not invent a fee. If the domain supplies no fee, do not add an ornamental fee row merely to show zero. Total debit may equal the payment amount only when supported by the instruction data.

### Details

Show, in order:

- **From account** — name and masked identifier;
- **To recipient** — recipient name and exact masked bank account details;
- **When** — immediate wording or selected scheduled date;
- **Payment reference**.

Use muted labels, prominent values and subtle dividers. Each logical group has a contextual **Edit** link or button returning to the owning step. Editing preserves every unrelated valid field.

### Submission

Primary label:

- immediate: **Send payment**;
- future-dated: **Schedule payment**.

Before applying any overlay action, submission re-resolves and validates the complete instruction against current effective state and separately authorises Amelia Hart (`user-amelia-hart`). She must remain active, belong to `business-caldermere`, retain `payments:create` through `role-administrator`, and satisfy the approved Amelia-only independent-submission policy.

No other user inherits this authority. Payments 1A introduces no threshold, second approver or pending approval action.

## Confirmation outcome

Confirmation is not Step 4. It has no `Step 4 of 4` or `Step 4 of 3` label.

### Required order

1. Status symbol with text alternative supplied by adjacent status text.
2. Status-specific heading.
3. Short explanatory statement.
4. Prominent GBP amount.
5. Recipient name.
6. Canonical status Badge.
7. Compact payment details.
8. Primary and secondary navigation actions.

### Immediate outcome

- Heading: **Payment submitted**.
- Canonical status: `processing`.
- Explain that the instruction is being processed. Do not say paid, complete, settled or successful settlement.

### Future-dated outcome

- Heading: **Payment scheduled**.
- Canonical status: `scheduled`.
- Show the selected scheduled date.
- Do not imply that a background worker will later execute it.

### Actions

- Primary: **View payment details**, linking to `/payments/[paymentId]`.
- Secondary: **Back to payments**, linking to `/payments`.

Both use Next.js client navigation so the EDS overlay remains mounted. The overview and detail consume effective state and show the temporary payment until full reload.

## Responsive and theme behaviour

- Retain the exact screen order and actions at every breakpoint.
- Use a comfortable constrained width on desktop.
- Stack actions where necessary on small screens without reversing their meaning or priority.
- Selection surfaces must fit the viewport and keep search, results and dismissal available.
- Long account and recipient names wrap or truncate without hiding the accessible full name.
- Monetary values remain legible without horizontal scrolling.
- All surfaces consume semantic Ledger tokens so light and dark themes retain hierarchy, boundaries and contrast.

## Receipt extension

A future completed payment may expose **Download receipt** from payment detail. The generated PDF must use canonical completed-payment data, suitable masking, Ledger branding and an explicit fictional-demonstration statement. There is no separate Print action.

New Payments V2 records are `processing` or `scheduled`, so neither qualifies for a completed-payment receipt. Receipt generation is a later, separate implementation slice.

## Open domain decisions

These are unresolved and must not be decided through visual treatment:

- whether restricted accounts can fund outgoing payments;
- duplicate-payment semantics beyond accidental repeat prevention;
- permitted payment-reference length and characters;
- weekend and bank-holiday scheduling rules;
- final optional confirmation-detail content beyond the required hierarchy.

The precise picker breakpoint, constrained content width and token combinations are flexible implementation details. They must use existing conventions and preserve this specification.
