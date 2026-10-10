# Payments V2 acceptance criteria

These criteria are the implementation and human-review checklist. Open domain decisions must be approved before their dependent criterion can pass.

## Visual fidelity

- [ ] The task uses a focused single-column layout within the existing Ledger Bank shell.
- [ ] Desktop content has a comfortable constrained width and does not stretch across the page.
- [ ] Steps display exactly `Step 1 of 3`, `Step 2 of 3` and `Step 3 of 3`.
- [ ] Confirmation displays no Step 4 progress label.
- [ ] Page headings are exactly **How much?**, **Sending to** and **Review payment**.
- [ ] Screen content follows the order documented in the UX specification.
- [ ] The source-account surface communicates identity and available balance before its interaction affordance.
- [ ] The entire account surface is visibly and semantically interactive, with explicit Change account copy.
- [ ] The account surface has stable default, hover, focus-visible and pressed treatment using Ledger tokens.
- [ ] You send and Recipient gets appear in one connected surface with a subtle divider.
- [ ] Editable and read-only amounts are visually distinct without weakening the receiving amount hierarchy.
- [ ] Financial values use prominent, aligned tabular numerals and explicit GBP context.
- [ ] Review uses muted labels, prominent values and subtle vertical dividers.
- [ ] Processing and Scheduled use existing canonical Badge treatments and visible text.
- [ ] Immediate confirmation says **Payment submitted** and does not imply settlement.
- [ ] Future confirmation says **Payment scheduled** and displays the selected date.
- [ ] Mobile retains the same content, order, records, financial meaning and actions as desktop.
- [ ] Light and dark themes retain readable boundaries, hierarchy, focus and status contrast.
- [ ] No decorative illustration, unsupported feature teaser or unrelated card style is introduced.

## Functional behaviour

- [ ] Only domain-eligible GBP source accounts can be selected.
- [ ] Account options show accurate masked identifiers and available balances.
- [ ] Changing account preserves the raw amount and revalidates it.
- [ ] Raw GBP input is parsed exactly into safe integer minor units without floating-point rounding.
- [ ] Empty, incomplete and excess-precision input is handled without silent coercion.
- [ ] Recipient gets mirrors You send only when the domain establishes no conversion or deduction.
- [ ] No unsupported currency is shown as executable or selectable.
- [ ] Immediate is the default timing choice.
- [ ] Schedule opens a focused dialog with a labelled date input and Repeats Select defaulted to Never.
- [ ] A repeating choice reveals Ends; On a specific date then reveals End date, which cannot be earlier than the payment date.
- [ ] Returning Repeats to Never hides Ends and End date, while Cancel restores the last confirmed schedule choices.
- [ ] Date validation follows the approved domain policy and does not silently move a date.
- [ ] Recipient selection resolves one specific eligible recipient record representing one saved bank account.
- [ ] Identical recipient names with different bank accounts remain independently identifiable and selectable.
- [ ] Search and no-results behaviour keep **Add recipient** separate from the result list.
- [ ] Customer-facing UI uses Recipient and never Beneficiary.
- [ ] Multiple selection preserves selected recipient IDs across search and group filtering.
- [ ] Multiple selection displays the selected-recipient count and summary before individual amount allocation.
- [ ] Recipient groups contain stable recipient IDs, require no membership and contain no monetary amounts.
- [ ] All recipients remain available in the complete directory regardless of group membership.
- [ ] Removing group membership does not remove the recipient.
- [ ] The add-recipient loop automatically selects the new recipient and preserves existing selections and payment draft data.
- [ ] Reference input preserves its value and applies only the approved reference policy.
- [ ] Continue blocks invalid progression without discarding valid fields.
- [ ] Edit returns to the relevant step and preserves unrelated fields.
- [ ] Browser Back preserves the draft during the active page lifecycle.
- [ ] Final submission revalidates against current effective state.
- [ ] Immediate submission creates one `processing` payment.
- [ ] Future submission creates one `scheduled` payment with the requested date.
- [ ] Rapid double click and Enter-plus-click cannot create a second payment.
- [ ] **Idempotent submission outcome:** one supplied payment identifier can create at most one payment. Accidental repeats receive the approved typed duplicate rejection; successful replay is not part of the current result contract.
- [ ] Duplicate identifier rejection applies no partial overlay change.
- [ ] The new payment appears in overview and detail during client-side navigation.
- [ ] Overview summaries include its canonical pending status without altering historical approval meaning.
- [ ] View payment details uses `/payments/[paymentId]`.
- [ ] Back to payments uses `/payments`.
- [ ] Full reload clears draft and temporary payment state.
- [ ] Reloading a temporary payment URL shows the approved unavailable-after-refresh recovery state.
- [ ] Unknown non-temporary IDs retain normal not-found behaviour.

## Accessibility

- [ ] Full-card account and recipient triggers are native buttons without nested interactive controls.
- [ ] Every input has a persistent accessible label.
- [ ] Recurrence choices use the existing labelled native Select and date-input patterns with progressive disclosure.
- [ ] Searchable selection surfaces have visible titles and appropriate descriptions.
- [ ] Modal pickers trap focus, support Escape and return focus to their trigger.
- [ ] Account and recipient options are operable with touch, pointer and keyboard.
- [ ] Selected and focused options are exposed programmatically and visually.
- [ ] Each searchable picker implements one coherent accessible selection model and does not mix incompatible listbox, radio-group or menu keyboard conventions.
- [ ] Revealed date content appears in logical reading and tab order.
- [ ] Hint and error content is associated with its control.
- [ ] Multi-field errors provide an accessible summary or equivalent focus target.
- [ ] Dynamic errors are announced with appropriate urgency; static guidance is not made noisy.
- [ ] Step changes move focus to an announced page heading or equivalent target.
- [ ] Edit navigation restores useful focus in the destination step.
- [ ] Submitting state has visible text, prevents re-entry and does not rely on Spinner alone.
- [ ] Status meaning is expressed with text, not colour or icon alone.
- [ ] Visible focus works in light and dark themes.
- [ ] Long names and amounts remain perceivable at narrow widths and browser zoom.
- [ ] Reduced-motion preferences are respected.

## Architecture and domain integrity

- [ ] Caldermere seed objects and collections remain unchanged after successful and rejected commands.
- [ ] All temporary changes use the EDS-001 in-memory overlay.
- [ ] No database, API write path, localStorage, sessionStorage, IndexedDB, mutation cookie or service-worker storage is introduced.
- [ ] The overlay survives supported Next.js client navigation and resets on full reload/provider remount.
- [ ] Payment-domain contracts and operations remain independent of React and storage implementation.
- [ ] Feature components invoke the named operation rather than dispatch arbitrary finance deltas.
- [ ] Acting user is explicitly Amelia Hart (`user-amelia-hart`), not the first user or a form-selected ID.
- [ ] Amelia is re-resolved as active, in `business-caldermere`, with `payments:create` before submission.
- [ ] Independent-submission authority is applied only to Amelia.
- [ ] Any other actor receives a structured authorisation error and no state change.
- [ ] Payments 1A creates no `PaymentApproval` record or pending approval action.
- [ ] Existing historical approval records and V1 approval presentation remain unchanged.
- [ ] Submission creates no ledger transaction.
- [ ] Submission does not change ledger or available balances.
- [ ] Submission does not reserve funds.
- [ ] Scheduled payment creation introduces no background job, queue or execution service.
- [ ] Existing Payments V1 seed overview, detail, status and approval behaviour passes regression checks.
- [ ] AccountSelector, CurrencyAmountInput and RecipientPicker remain Bank-local.
- [ ] Synthetic Finance `Beneficiary` remains the compatible internal representation for one recipient account; no broader relationship entity is introduced.
- [ ] No existing shared component API or design-system package export is changed for these patterns.
- [ ] No speculative FX, international, approval, recipient-management or receipt behaviour appears in the journey.

## Receipt extension

- [ ] Initial Payments V2 includes no receipt action on creation or confirmation.
- [ ] Processing and scheduled payments do not offer a completed-payment receipt.
- [ ] A future completed-payment detail may provide one **Download receipt** PDF action.
- [ ] No separate Print action is planned.

## Open-decision gates

Implementation cannot claim full acceptance until the affected behaviour is approved:

- [ ] Restricted-account eligibility is defined.
- [ ] Duplicate semantics beyond accidental repeated submission are defined or explicitly deferred.
- [ ] Payment-reference length and character policy is defined.
- [ ] Weekend and bank-holiday scheduling behaviour is defined.
- [ ] Any optional confirmation-detail content is approved or explicitly omitted.

## Verification evidence expected

- [ ] TypeScript, Bank build and relevant unit/integration tests pass.
- [ ] A real-browser test covers creation, client navigation, detail, Back and full reload reset.
- [ ] Keyboard and focus behaviour is exercised in a browser.
- [ ] Responsive and light/dark visual review is completed by a human.
- [ ] Scope, persistence and baseline-immutability audits are recorded.
- [ ] `git diff --check` passes.
