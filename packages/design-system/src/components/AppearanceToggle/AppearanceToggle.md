# AppearanceToggle

## Purpose

`AppearanceToggle` is a compact control for switching an application's effective appearance between light and dark. It owns the visual and accessibility contract only; consuming applications own preference state, system colour-scheme detection and document theme application.

## Anatomy

- Native button
- Sun icon for effective light appearance
- Moon icon for effective dark appearance

## Required elements

- `appearance`: the current effective `light` or `dark` appearance
- `onAppearanceChange`: receives the requested effective appearance

## Behaviour

Activating the control requests the opposite appearance. The component is controlled and does not read system settings, modify the document, or persist a preference.

## Accessibility

The native button supports keyboard activation. Its stable accessible name is “Dark appearance”; `aria-pressed` communicates whether dark appearance is active. The title describes the action that activation will perform. Focus, hover and pressed treatments use Ledger semantic tokens.

## Usage guidance

Place the toggle in a persistent application header or utility area. Applications that support a `system | light | dark` preference should pass the resolved effective appearance and convert the first user interaction into an explicit light or dark preference.

## Anti-patterns

- Do not store application theme state inside the component.
- Do not use it as a substitute for a multi-option appearance settings control when users must explicitly return to System without refreshing.
- Do not add application-specific dark-mode CSS around the component.

## Related components

Use `Button` for general actions. `AppearanceToggle` is intentionally specialised because it has a stable pressed-state accessibility contract and paired sun/moon iconography.
