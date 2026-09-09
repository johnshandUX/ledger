# Ledger Design System

Ledger Design System is the shared design foundation for Ledger Bank.

It provides reusable design tokens, UI components and product patterns that are represented consistently across code, Storybook and Figma.

The system is designed to support both human designers and AI-enabled product development workflows.

---

## 1. Purpose

Ledger Design System exists to:

- create consistent user experiences across Ledger products
- provide reusable, accessible UI components
- maintain parity between code, Storybook and Figma
- reduce duplicated design and implementation decisions
- provide clear constraints for AI coding and design agents
- support future theming and brand variation without rewriting components

The design system is the source of truth for reusable UI implementation.

Ledger Bank should consume the design system rather than recreate its components or visual rules.

---

## 2. Design direction

Ledger is a fictional commercial and institutional banking product.

The visual direction is:

- institutional
- authoritative
- simple
- spacious
- modern
- predominantly monochrome
- restrained rather than decorative

The primary visual palette uses white, very dark grey and neutral greys.

Colour should be introduced deliberately for areas where it provides meaning, such as:

- status
- validation
- data visualisation
- alerts
- rich imagery
- future product or brand themes

Controls and containers may use rounded corners, but should not have an excessively soft or consumer-fintech appearance.

---

## 3. System architecture

The design system is organised into four conceptual layers.

### Foundations

Reusable visual values used throughout the system.

Current foundations include:

- colour
- typography
- spacing
- radius
- borders
- elevation

### Components

Reusable interface building blocks.

Examples include:

- Button
- Input
- Select
- Checkbox
- Radio
- Textarea
- Link
- Badge
- Alert
- Card
- Table
- Tabs
- Pagination

Components should be product-agnostic where possible.

### Patterns

Reusable combinations of components that solve common interaction problems.

Examples may include:

- form layouts
- filtering
- search
- data tables
- confirmation flows
- account selection
- task status
- review and submit flows

Patterns may contain more domain knowledge than individual components.

### Product experiences

Ledger Bank screens and journeys consume foundations, components and patterns.

Product-specific UI should not be added to the core component library unless it represents a genuinely reusable pattern.

---

## 4. Token model

Ledger uses design tokens to represent reusable design decisions.

Tokens should be used for intentional system-level values.

Not every numeric value must become a token.

### Primitive tokens

Primitive tokens define raw values.

Examples:

- neutral colour scales
- spacing scale
- radius scale
- font sizes
- font weights
- border widths

### Semantic tokens

Semantic tokens describe purpose rather than appearance.

Examples:

- `--ledger-color-background`
- `--ledger-color-surface`
- `--ledger-color-text`
- `--ledger-color-text-secondary`
- `--ledger-color-border`
- `--ledger-color-action`
- `--ledger-color-error`

Components should consume semantic colour tokens wherever possible.

Components should not depend directly on primitive colours unless there is a clear reason.

---

## 5. Theming

Ledger currently supports a single light theme.

The architecture must allow future support for:

- dark mode
- alternative Ledger themes
- white-label or branded implementations

Themes should primarily work by remapping semantic tokens.

Components should not require separate implementations for each theme.

Do not create dark-mode variants until they are required.

---

## 6. Component principles

Components should:

- use React and TypeScript
- use semantic HTML wherever possible
- support keyboard interaction
- meet appropriate accessibility requirements
- use Ledger design tokens
- expose a clear and minimal API
- avoid unnecessary variants
- avoid product-specific assumptions unless explicitly designed as a pattern
- include Storybook documentation
- behave consistently across products

Components should not introduce arbitrary colours, spacing values, radii or typography values when an appropriate Ledger token already exists.

If a required design decision is missing from the token system, it should be identified explicitly before adding a new token.

---

## 7. Icons

Ledger uses an established open-source icon library as the foundation for interface icons.

The initial icon source is Lucide.

Icons used by Ledger products should be exposed through the Ledger Design System rather than imported directly from the underlying icon library by product applications.

This allows Ledger to maintain consistent icon selection, sizing, accessibility and visual treatment while keeping the underlying icon source replaceable.

### Principles

- Use icons to support meaning, navigation or interaction rather than decoration.
- Prefer a consistent outline icon style.
- Use Ledger design tokens for icon colour where appropriate.
- Do not use icons as the only method of communicating important information.
- Decorative icons should be hidden from assistive technology.
- Meaningful standalone icons require an accessible name.
- Do not introduce arbitrary icon sizes when an established Ledger icon size is available.
- Do not modify or create custom SVG icons when an appropriate approved icon already exists.

### Initial status icons

The first approved Ledger icons will support:

- information
- success
- warning
- error

These will initially be used by feedback components such as Alert.

The icon foundation should remain small and expand only when product requirements identify additional icon needs.

---

## 8. Accessibility

Accessibility is a core requirement of Ledger Design System.

Components should:

- use native HTML semantics wherever possible
- provide visible keyboard focus
- support keyboard navigation
- expose accessible labels and descriptions
- use appropriate ARIA only where native semantics are insufficient
- maintain appropriate colour contrast
- avoid interaction patterns that depend only on colour

Accessibility should be considered during component creation rather than added afterwards.

---

## 9. Component states

Components should only expose states that are deliberately supported by the design system.

Do not automatically implement every technically possible HTML state.

For example, Ledger Button currently supports:

- primary
- secondary

Disabled Button is not currently a supported Ledger design-system pattern.

New states and variants should be added because of demonstrated product requirements rather than pre-emptively.

---

## 10. Storybook

Storybook is the implementation reference for Ledger components.

Every reusable component should include stories covering its supported states and variants.

Storybook should be used to:

- review visual implementation
- test component behaviour
- inspect accessibility
- document supported variants
- compare implementation against Figma

Storybook is not a separate design system. It displays the implementation of Ledger Design System.

---

## 11. Figma parity

Ledger components and tokens should have equivalent concepts in Figma.

Names should align as closely as practical between design and code.

Example:

Code:

`--ledger-color-text`

Figma:

`Color/Text`

Code:

`--ledger-radius-medium`

Figma:

`Radius/Medium`

Code:

`Button / primary`

Figma:

`Button / Primary`

Exact technical syntax does not need to match, but the underlying design concept should.

Avoid creating Figma-only or code-only design decisions without a clear reason.

---

## 11. AI-enabled development

Ledger Design System is designed to be understandable by AI agents.

Agents should be able to:

- identify existing components
- understand allowed tokens
- reuse existing patterns
- identify missing system capabilities
- create components within established constraints
- avoid inventing arbitrary visual styles

AI-generated output must still be reviewed as design and engineering work.

Agents should extend the system rather than bypass it.

---

## 12. Source of truth

The different representations of Ledger have different responsibilities:

- Design tokens define reusable design values.
- React components define implementation behaviour.
- Storybook documents and tests implemented components.
- Figma represents the design system for design workflows.
- Ledger Bank consumes the system in product experiences.
- Agent instructions define how AI tools are allowed to modify or consume the system.

Changes should maintain conceptual parity across these representations.

---

## 13. Current status

Ledger Design System is currently in its initial foundation stage.

Foundations currently include:

- colour
- typography
- spacing
- radius
- borders
- elevation

Components currently include:

- Button
- Input