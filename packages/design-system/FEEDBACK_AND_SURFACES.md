# Ledger Feedback and Surfaces

This document defines the shared rules for Ledger feedback, status and surface components.

It applies to:

- Badge
- Alert
- Card
- Link

These components should remain visually restrained and consistent with Ledger's institutional, professional banking direction.

---

## 1. General principles

Feedback and surface components should:

- communicate hierarchy clearly
- avoid unnecessary decoration
- use colour only when it carries meaning
- remain legible and accessible
- use Ledger foundations consistently
- avoid excessive elevation
- feel appropriate for data-heavy professional interfaces

Monochrome styling should remain the default where status or emphasis does not require colour.

---

## 2. Status colour

Colour may be used when it communicates a meaningful state.

Typical semantic states may include:

- neutral
- informational
- success
- warning
- error

Status colours should not be introduced as arbitrary component-specific values.

If a required semantic status colour does not yet exist in the token system, the gap should be identified and reviewed before implementation.

Colour should not be the only method used to communicate important status information.

---

## 3. Badge

Badge is a compact status or classification component.

Typical uses include:

- payment status
- task status
- account state
- processing state
- category or classification

Badge should:

- remain visually compact
- use clear readable text
- use restrained padding
- use rounded geometry appropriate to a compact status label
- support semantic status treatments where required
- not be used as an interactive control unless explicitly designed for that purpose

Badge should not be used for long explanatory messages.

---

## 4. Alert

Alert communicates information that requires greater attention than inline helper text.

Typical uses include:

- important information
- success confirmation
- warnings
- errors
- actions requiring attention

Alert should:

- clearly communicate its semantic purpose
- include text rather than relying on colour alone
- use a strong but restrained visual boundary
- use Ledger typography
- use appropriate spacing
- support optional heading and supporting content where required
- remain readable in dense banking interfaces

Alert should not resemble advertising, promotional banners or decorative cards.

---

## 5. Card

Card is a surface used to group related content.

Card should:

- use `--ledger-color-surface`
- use Ledger border tokens
- use Ledger radius tokens
- rely primarily on border and spacing for separation
- use elevation sparingly
- support responsive layouts
- avoid unnecessary visual depth

The default Ledger Card should feel structured rather than floating.

Cards should not become the default container for every piece of content.

Use them where grouping materially improves comprehension or hierarchy.

---

## 6. Card spacing

Card internal spacing should use Ledger spacing tokens.

Spacing should feel generous enough for professional interfaces without creating excessive whitespace.

Do not introduce arbitrary card-specific spacing values when the existing spacing scale is suitable.

---

## 7. Link

Link represents navigation to another destination or resource.

Link should:

- use semantic anchor markup where navigation is intended
- be visually distinguishable from surrounding body text
- provide a clear hover state
- provide a visible keyboard focus state
- not rely solely on colour to communicate interactivity where context makes the link ambiguous
- use Ledger typography

Do not use Link when the interaction performs an action that should be represented by Button.

---

## 8. Interactive distinction

Use components according to intent:

- Button performs an action
- Link navigates
- Badge communicates status or classification
- Alert communicates important feedback
- Card groups related content

Do not substitute one component for another based only on visual appearance.

---

## 9. Accessibility

Feedback and surface components should:

- maintain sufficient text and border contrast
- provide meaningful text for status
- preserve semantic HTML where possible
- expose visible keyboard focus for interactive elements
- avoid communicating critical meaning through colour alone
- preserve logical reading order

Status icons, if introduced later, should not duplicate accessible text unnecessarily.

---

## 10. Storybook representation

Storybook should demonstrate:

Badge:
- default or neutral treatment
- supported semantic states

Alert:
- supported semantic states
- representative heading and body content where supported

Card:
- representative content hierarchy
- realistic width
- border and spacing treatment

Link:
- default
- hover where practical
- focus behaviour

Stories should represent real interface usage rather than artificial showcase styling.

---

## 11. Figma parity

Figma components should align with code for:

- component names
- status terminology
- semantic colours
- padding
- radius
- borders
- typography
- supported variants

Do not create Figma-only visual status treatments without a corresponding system decision.

---

## 12. Scope

This specification defines the foundational feedback and surface family.

Do not introduce:

- toast systems
- notification centres
- banners
- promotional cards
- interactive status controls
- complex dismissible alerts
- stacked notification systems

unless explicitly required by a future Ledger product need.