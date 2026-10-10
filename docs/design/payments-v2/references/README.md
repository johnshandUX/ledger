# Payments V2 references

## Visual-reference status

No approved screenshot, Figma frame, prototype export or other visual asset is stored in this directory at the time of this handoff. The written hierarchy and interaction requirements in the parent pack are the approved reference. Do not fabricate visual references or describe an implementation screenshot as approved design.

When visual references are approved later, add version-controlled files or durable links here with:

- source and owner;
- approval date;
- represented breakpoint and theme;
- applicable screen/state;
- known differences from the written specification.

If a future asset conflicts with EDS-001, the Payments 1A authorisation policy, domain truth or an accessibility requirement, stop and resolve the conflict rather than copying it silently.

## Repository evidence

### Architecture and domain planning

- [EDS-001: Ephemeral Demo State](../../../architecture/EDS-001-ephemeral-demo-state.md)
- [Payments ephemeral operations plan](../../../architecture/payments-ephemeral-operations-plan.md)
- [Repository agent guidance](../../../../AGENTS.md)
- [Bank agent guidance](../../../../apps/bank/AGENTS.md)

### Ledger Bank

- Payments overview: `apps/bank/app/payments/page.tsx`
- Payment detail: `apps/bank/app/payments/[paymentId]/page.tsx`
- Responsive Payments presentation: `apps/bank/app/payments/PaymentsDataTable.tsx`
- Payments styles: `apps/bank/app/payments/payments.css`
- Payment read models: `apps/bank/src/finance/payments.ts`
- Payment presentation helpers: `apps/bank/src/presentation/payments.ts`
- Minor-unit formatting adapter: `apps/bank/src/presentation/money.ts`
- Configured demo identity: `apps/bank/src/finance/users.ts`
- Product shell and navigation: `apps/bank/app/ProductShell.tsx`
- Existing EDS provider: `apps/bank/app/BankStateProvider.tsx`
- Effective-state hooks: `apps/bank/app/useBankEffectiveState.ts`
- Effective-state selectors: `apps/bank/src/state/effective-state.ts`

### Synthetic Finance

- Payment and status model: `packages/synthetic-finance/src/domain/payment.ts`
- Approval model: `packages/synthetic-finance/src/domain/payment-approval.ts`
- Account model: `packages/synthetic-finance/src/domain/account.ts`
- Balance model: `packages/synthetic-finance/src/domain/balance.ts`
- Recipient account record, internally named Beneficiary: `packages/synthetic-finance/src/domain/beneficiary.ts`
- Caldermere users: `packages/synthetic-finance/src/datasets/caldermere/users.ts`
- Caldermere roles: `packages/synthetic-finance/src/datasets/caldermere/roles.ts`
- Permissions: `packages/synthetic-finance/src/datasets/caldermere/permissions.ts`
- Dataset validation: `packages/synthetic-finance/src/validation/index.ts`

### Ledger Design System

- [Design-system contract](../../../../packages/design-system/DESIGN_SYSTEM.md)
- [Form-control family contract](../../../../packages/design-system/FORM_CONTROLS.md)
- [Feedback and surfaces contract](../../../../packages/design-system/FEEDBACK_AND_SURFACES.md)
- Component manifest: `packages/design-system/src/docs/componentManifest.ts`
- Component-specific Markdown contracts under `packages/design-system/src/components/`

## External inspiration

The approved amount-entry direction is inspired by the simplicity of connected sending and receiving amount presentation used by products such as Wise. This is directional inspiration only. No external screenshot or proprietary asset is included, and Ledger must use its own design tokens, component contracts, content and domain behaviour.
