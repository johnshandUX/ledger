# Ledger Bank Payments V2 design handoff

- **Status:** Approved UX handoff; domain decisions listed in this pack remain open
- **Product:** Ledger Bank
- **Architecture:** [EDS-001: Ephemeral Demo State](../../architecture/EDS-001-ephemeral-demo-state.md)
- **Domain plan:** [Payments ephemeral operations plan](../../architecture/payments-ephemeral-operations-plan.md)
- **Scope:** Domestic GBP payment design, including the shared recipient-account model used by Single and Multiple modes

## Purpose

This version-controlled pack preserves the approved Payments V2 experience for implementation. It defines the required content hierarchy, interaction behaviour, component boundaries, accessibility expectations and acceptance criteria. Implementation must not reinterpret an approved decision without product and design approval.

This pack is not application code, a visual redesign of Ledger Bank, a new design-system component specification or permission to resolve open domain rules implicitly.

## Experience summary

Payments V2 has three input/review steps followed by a confirmation outcome:

1. **How much?** Select an eligible GBP source account and enter the sending amount.
2. **Sending to** Choose immediate or future-dated timing, select a specific recipient account and enter the payment reference.
3. **Review payment.** Review the complete instruction, edit prior sections and submit.

**Confirmation outcome:** Show the canonical `processing` or `scheduled` result. Confirmation is not Step 4 of the progress indicator.

The acting user is Amelia Hart (`user-amelia-hart`). Payments 1A authorises only this explicitly identified user to submit independently. The journey creates no approval action, ledger transaction, balance deduction or funds reservation.

## Documents

- [UX specification](ux-specification.md) — screen content, hierarchy, responsive presentation and approved copy.
- [Interaction specification](interaction-specification.md) — state, navigation, focus, validation and recovery behaviour.
- [Component mapping](component-mapping.md) — existing Ledger primitives and Bank-local composed patterns.
- [Acceptance criteria](acceptance-criteria.md) — reviewable visual, functional, accessibility and architecture requirements.
- [References](references/README.md) — repository evidence and the current visual-reference status.

## Source-of-truth order

When documents appear to conflict, use this order and stop for approval rather than guessing:

1. Accepted architecture decisions, especially EDS-001.
2. Approved Payments 1A authorisation and lifecycle policy.
3. This design handoff pack for Payments V2 UX.
4. Existing Ledger Design System component contracts.
5. Flexible implementation details explicitly identified in this pack.

Synthetic Finance remains the source of canonical domain contracts and immutable Caldermere data. Ledger Bank owns the temporary application overlay and product composition. The Ledger Design System owns reusable UI primitives and tokens.

## Scope boundaries

Included:

- domestic GBP only;
- eligible existing source accounts;
- existing recipient accounts, each represented by one stable recipient record;
- immediate and future-dated instructions;
- exact monetary entry, review, submission and confirmation;
- effective overview/detail visibility during the active page lifecycle;
- responsive, light/dark and accessible behaviour.

Excluded:

- FX, international or cross-currency execution;
- implementation of new-recipient creation, recipient groups or recipient management;
- production bulk-payment execution, payment templates or recurring payments;
- approval thresholds or secondary approval flows;
- settlement, transaction booking, balance deduction or funds reservation;
- persistent drafts or submitted records;
- background scheduled execution;
- receipt generation within the creation journey;
- design-system promotion of the three Bank-local financial patterns.

## Recipient model

One recipient represents one saved payment-destination bank account. A recipient has one stable unique record ID, a display name and the supported bank account details. Two recipient records may have the same display name when their bank accounts differ; customers select each record independently.

Ledger Bank does not require a separate person, organisation, supplier or Contact relationship, and it does not model one recipient with multiple destinations. Customer-facing language uses **Recipient**. Existing Synthetic Finance `Beneficiary` records remain compatible and may continue representing recipient records internally without introducing a new domain entity.

Recipient groups are optional collections of stable recipient record IDs. A recipient may belong to zero, one or multiple groups and remains visible in the complete recipient directory regardless of membership. Groups help select recipient accounts; they do not own recipients, delete recipients when membership changes, act as payment templates or store payment amounts.

The multiple-recipient selection, repeatable add-recipient loop and Recipients Manager described in this pack are approved future behaviour. They do not expand the current Page 1 prototype or authorise implementation in this documentation update.

## Change control

Open domain decisions are recorded in the UX specification and acceptance criteria. An implementer may choose flexible technical details only when the observable approved behaviour and existing component contracts remain unchanged. Any change to copy, information order, authorisation, lifecycle meaning, executable currencies, field preservation, confirmation status or EDS behaviour requires explicit approval.
