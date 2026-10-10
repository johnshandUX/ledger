# Payments V2 interaction specification

## State model

Keep four concerns distinct:

1. **Raw journey draft:** selected identifiers, raw amount string, timing choice, date and reference.
2. **Domain instruction:** exact parsed minor units and validated relationships.
3. **Submission command:** instruction plus trusted actor/business context and unique submission identifier.
4. **Effective payment record:** immutable Caldermere baseline plus the temporary EDS payment overlay.

The raw draft belongs to the client journey. Domain validation and authorisation remain framework-independent. The UI must not manufacture eligibility, lifecycle or permission outcomes.

## Account selection

1. The source-account button exposes an accessible name including the current account and the action to change it.
2. Activation opens the account picker and moves focus to its labelled surface or search field according to the implemented Dialog/Sheet contract.
3. The picker lists eligible GBP accounts with name, masked identifier and available balance.
4. Search filters visible options without altering the canonical account collection.
5. Implementation must choose one coherent accessible selection model for the local list and follow that model's keyboard contract consistently; it must not mix listbox, radio-group and menu conventions. Enter or Space selects where required by the chosen model.
6. Selection closes the surface, returns focus to the source-account button and announces the newly selected account when needed.
7. The raw amount remains unchanged and is revalidated against the new account.
8. Escape or explicit dismissal makes no selection and returns focus to the trigger.

The full-card trigger is one button. Do not place nested buttons or links inside it.

## Raw monetary entry

- Use a text input with decimal input mode so the raw string can preserve incomplete states.
- Accept only syntax permitted by the approved GBP parser.
- Convert to integer minor units without binary floating-point arithmetic.
- Do not coerce empty or partial input to zero.
- Do not silently round excess precision.
- Do not reformat on every keystroke if doing so moves the caret or changes user intent.
- On blur or progression, formatting may be normalised only after successful parsing.
- Associate parse and funds errors with the editable sending field.

The receiving amount is derived output. When sending input is valid and the rules confirm no fee/conversion/deduction, mirror the exact GBP minor-unit amount. When input is incomplete or invalid, show a neutral placeholder rather than a fabricated value.

## Timing and date

- Immediate is the initial selection for a new draft.
- Schedule opens a focused dialog with the existing labelled native date input and a compact **Repeats** Select.
- Repeats defaults to **Never**. Weekly, Fortnightly, Monthly, Quarterly and Annually progressively reveal an **Ends** Select.
- Ends defaults to **Never**. Choosing **On a specific date** reveals a labelled native End date input.
- The end date must be on or after the start date. Returning Repeats to Never hides and excludes both end controls from the confirmed schedule.
- Cancel discards only the editable dialog draft. Reopening restores the last confirmed date, repeat and end choices.
- Returning to immediate removes the confirmed schedule without changing the amount or source account.
- Progression validates the date and conditional end date using the approved prototype policy.
- Unsupported dates remain visible so the user can correct them; they are not silently shifted.

## Recipient search and selection

1. Activating the recipient control opens a labelled searchable surface.
2. Initial focus moves predictably to search or the current selection.
3. Search matches approved presentation fields without changing domain eligibility.
4. Each result represents one recipient record and identifies its name and masked bank account details. Identical names remain independently selectable through their different record IDs and account details.
5. The current option and focused option are visually and programmatically distinct.
6. Keyboard users can move through, choose and dismiss the list.
7. Selecting a recipient closes the Single-mode surface, returns focus to the trigger and updates its visible value.
8. No-result content explains that no recipients match. The separately labelled **Add recipient** action may remain available; it is not presented as a search result.

An unsupported recipient record must not be submitted even if stale UI state references it. Final domain validation re-resolves the selection by its stable recipient ID.

## Recipient groups and multiple selection

- Groups contain stable recipient record IDs. Membership is optional and many-to-many: one recipient may belong to zero, one or multiple groups.
- Search and group filtering alter only the visible result set. They never clear selected recipient IDs.
- Selecting a group assists selection; it does not create a payment template, assign amounts or remove access to ungrouped recipients in the complete directory.
- Removing a recipient ID from a group changes only membership and never deletes the recipient record.
- Multiple mode exposes a persistent selected-recipient count and summary before continuing to individual amount allocation.
- Recipient rows prioritise name, masked bank account details and the selection control. Per-row group badges are optional and are not required for comprehension.

## Add-recipient loop

1. **Add recipient** opens the approved recipient-account entry task.
2. Name and supported bank account details are required; assigning existing groups is optional.
3. Future group assignment uses a searchable multi-select without requiring a new design-system primitive now.
4. When implemented, one named EDS-001 operation validates and adds the Synthetic Finance-compatible recipient record and any optional group membership atomically.
5. Success returns to recipient selection, automatically selects the new recipient ID and preserves all prior selected recipient IDs, filters and payment draft data.
6. The action remains available so the task can be repeated.

Creating, renaming and removing groups belongs to the future Recipients Manager, not this payment-selection loop.

## Reference entry

- Preserve the reference while moving between steps.
- Client feedback may identify obviously empty input, but the domain owns the accepted rule.
- Do not add UI-only character restrictions beyond the approved policy.
- Error text is linked to the field and retains the entered value.

## Step progression and editing

- Continue validates the fields owned by the current step before advancing.
- Advancing and Edit actions use client navigation/state transitions that retain the root EDS provider.
- Step 2 requires a valid Step 1 state; Step 3 requires valid prior state.
- Direct access to a later step resolves to the earliest incomplete step.
- Contextual Edit returns to the owning step without clearing other fields.
- Returning forward revalidates dependent fields rather than trusting an earlier result.
- Browser Back follows the visible journey history and preserves the in-memory draft while the page instance remains active.
- A full reload intentionally clears draft and submitted overlay state.

## Client feedback versus domain validation

Client feedback may:

- identify required empty fields;
- expose raw syntax problems;
- control disclosure, loading and focus;
- prevent an obviously incomplete step transition.

Only the domain operation may decide:

- account and recipient eligibility;
- business/user relationships and authorisation;
- available-funds sufficiency;
- accepted reference policy;
- valid processing date;
- duplicate payment identifier;
- initial canonical status.

Client success must never override a domain rejection.

## Review and submission

1. Review renders from the current resolved draft, not copied display strings.
2. Activating submit sets an accessible submitting state and prevents re-entry.
3. Re-resolve Amelia, account, balance and the selected recipient record from effective state.
4. Authorise Amelia independently from validating the instruction.
5. Validate the complete instruction.
6. If rejected, apply no overlay delta, restore the available action, retain all fields and focus an error summary or relevant error.
7. If accepted, apply one payment-creation overlay action atomically.
8. Navigate to confirmation through Next.js client navigation.

### Accidental duplicate prevention

- One unique payment/submission identifier belongs to one logical reviewed draft.
- Retain it across repeated clicks or retries of the same submission attempt.
- Check effective payments before applying the creation action.
- Disable the primary action while submission is in progress.
- Guard Enter-plus-click and rapid double-click paths.
- An existing identifier produces the approved structured duplicate error and no second record.

Commercially identical instructions with different identifiers remain an open domain-policy question; do not add fingerprint or time-window blocking without approval.

## Submission errors

- Field-specific errors appear with their controls.
- Cross-field, authorisation or changed-effective-state errors appear in a summary and, where useful, beside the affected section.
- Dynamic urgent failures may use `role="alert"`; static guidance should not.
- Focus moves to the summary or first invalid field after a failed submit.
- Preserve valid values and explain what must change.
- Network/persistence language is inappropriate because EDS submission is local and in-memory.

## Confirmation navigation

- **View payment details** goes to the canonical `/payments/[paymentId]` route.
- **Back to payments** goes to `/payments`.
- Both routes resolve the same effective record within the active page instance.
- The draft is no longer submit-ready after success; browser Back must not create another payment without an intentional new submission.

## EDS reset and temporary detail resolution

Temporary payment IDs must be distinguishable from Caldermere seed identifiers by a reserved, implementation-defined namespace. The exact prefix is a flexible technical detail and must be documented in code and tests without changing user-visible behaviour.

Within the active page lifecycle:

- overview includes the temporary record;
- detail resolves it through effective-state selectors;
- confirmation resolves it from the overlay;
- client-side navigation retains it.

After full reload:

- the overlay is empty;
- `/payments` shows only baseline records;
- a temporary detail or confirmation URL shows an explanatory unavailable-after-refresh state with navigation back to Payments and, optionally, Create another payment;
- an unknown non-temporary identifier retains normal not-found behaviour.

Do not reconstruct a temporary record, mark it failed/cancelled or store it outside the EDS provider.

## Focus and keyboard requirements

- Every full-card trigger is a native button with visible focus.
- Dialog/Sheet selection surfaces provide an accessible title, trapped modal focus, Escape dismissal and trigger focus return.
- Radio groups preserve native keyboard behaviour.
- Search results and selectable recipient records expose programmatic selected/focused state.
- Revealed date content appears in logical reading and tab order.
- Step changes place focus on the new page heading or an equivalent announced target.
- Edit actions move focus to the relevant heading/control after navigation.
- Submitting state remains named; a Spinner alone is insufficient.
- Status is communicated by text and Badge label, never colour or icon alone.
- Reduced-motion preferences are respected by existing primitives and any local transitions.
