# Ledger Design System: Agent Instructions

This repository contains Ledger Design System.

Before making changes, read `DESIGN_SYSTEM.md`.

When working on form controls, also read `FORM_CONTROLS.md` and treat it as the component-family specification for Input, Textarea, Select, Checkbox and Radio.

If `FORM_CONTROLS.md` conflicts with a component's existing implementation, follow the specification and report the implementation change. If it conflicts with `DESIGN_SYSTEM.md`, stop and report the conflict rather than choosing one silently.

When working on Badge, Alert, Card or Link, also read `FEEDBACK_AND_SURFACES.md` and treat it as the component-family specification.

If `FEEDBACK_AND_SURFACES.md` conflicts with a component's existing implementation, follow the specification and report the implementation change. If it conflicts with `DESIGN_SYSTEM.md`, stop and report the conflict rather than choosing one silently.

Do not invent semantic status colours that are not defined by the Ledger token system. Report the token gap instead.

The goal is to maintain a coherent, accessible design system with parity across code, Storybook and Figma.

## Working principles

When working in this repository:

1. Inspect the existing implementation before creating or modifying components.
2. Reuse existing Ledger tokens, components and conventions wherever possible.
3. Do not create arbitrary visual values when an appropriate Ledger token exists.
4. Do not introduce a new token solely to avoid using an existing appropriate token.
5. Do not create new component variants or states unless they are part of the requested design-system scope.
6. Prefer native HTML semantics and browser behaviour over custom implementations.
7. Maintain accessibility and keyboard behaviour.
8. Keep component APIs small and explicit.
9. Follow existing file structure, naming and coding conventions.
10. Do not add third-party UI component libraries unless explicitly requested.

## Design tokens

Components should consume Ledger design tokens.

For colour, prefer semantic tokens such as:

- `--ledger-color-background`
- `--ledger-color-surface`
- `--ledger-color-text`
- `--ledger-color-text-secondary`
- `--ledger-color-border`
- `--ledger-color-action`
- `--ledger-color-error`

Do not hard-code colours inside components.

Use the existing Ledger spacing, radius, typography and border scales rather than introducing arbitrary values.

Not every numeric value needs to become a token. If a value represents component-specific behaviour rather than a reusable system decision, it may remain local.

If the existing token system cannot express a required design decision, identify the gap before adding a new foundation token.

## Components

Use the existing `Button` and `Input` components as reference implementations for repository conventions.

Each reusable component should normally contain:

- component implementation
- component styles
- Storybook stories

For example:

`ComponentName.tsx`
`ComponentName.css`
`ComponentName.stories.tsx`

Do not duplicate functionality already provided by another Ledger component.

Do not add speculative variants.

## Storybook

Every new reusable component must include Storybook stories representing its supported variants and important states.

Stories should demonstrate the public component API rather than recreate the component with custom markup.

Storybook should remain a reliable representation of the implemented design system.

## Accessibility

Accessibility is a requirement, not an optional enhancement.

Use:

- semantic HTML
- associated labels
- keyboard-accessible interaction
- visible focus treatment
- appropriate accessible names and descriptions

Use ARIA only when native HTML semantics are insufficient.

Do not remove native accessibility behaviour without a documented reason.

## Figma parity

Consider whether a change affects the equivalent Figma representation.

Component names, variants and design concepts should align with Figma wherever practical.

Do not create implementation-only visual variants simply because they are easy to implement.

When a change requires a corresponding Figma update, identify it clearly.

## Scope control

When asked to implement multiple components:

1. inspect the existing foundations first
2. identify any missing system-level decisions
3. reuse established patterns
4. implement components consistently
5. run appropriate checks
6. report any design-system gaps rather than silently inventing solutions

If requirements are ambiguous and the decision would create a new design-system convention, do not guess. Surface the decision for review.

## Product boundary

This repository contains the reusable Ledger Design System.

Do not add Ledger Bank product screens or product-specific business logic to this repository.

Product experiences belong in the `ledger-bank` application.

Reusable banking patterns may be added to the design system when explicitly requested and when they are sufficiently reusable.

## Validation

After making changes:

- ensure TypeScript remains valid
- ensure Storybook can build/run
- check for obvious accessibility issues
- check that existing components have not been unintentionally changed
- report any new tokens, dependencies, variants or conventions introduced

Do not claim a check passed unless it was actually run.