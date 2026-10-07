# Button

## Purpose
Button triggers an action. Use its variant to communicate action intent, not decoration. The optional `size` is `default` or `small`.

## Anatomy
A native `button` contains the visible action label. `children` is required; `variant` is optional and defaults to `primary`. Standard button attributes, including `type`, `disabled`, `name` and `value`, pass through.

## Behaviour
Supported variants are `primary`, `secondary` and `destructive`. The default size remains suitable for primary tasks. Use `small` only for constrained, secondary action layouts; preserve adequate spacing around it and do not globally shrink mobile actions. Button preserves native activation, form submission and disabled behaviour.

## Accessibility
Use a concise label that describes the action. Set `type` explicitly inside forms. Do not remove visible focus styling. A destructive appearance warns about intent but does not replace confirmation for irreversible actions.

## Usage guidance
Use primary for the main action, secondary for lower-emphasis alternatives and destructive only for destructive or irreversible intent.

## Anti-patterns
Do not use Button for navigation, use vague labels such as “Yes”, add decorative variants or use destructive styling merely for visual emphasis.

## Related components
Use semantic anchors with `.ledger-link` for navigation. Use AlertDialog when a consequential action requires explicit confirmation.
