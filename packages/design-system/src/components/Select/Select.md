# Select

## Purpose
Select chooses one value from a defined list using the native `select` element.

## Anatomy
A visible label and `options` array are required. Optional `placeholder`, `hint` and `error` content support field guidance. Options have a label, value and optional disabled state.

## Behaviour
Select preserves native keyboard, form and platform picker behaviour. A placeholder is rendered as a disabled empty option. Native select attributes pass through except custom children, which are intentionally replaced by the explicit options contract.

Select uses the same 1px semantic boundary, control background and state-token treatment as Input and Textarea while retaining its native picker behaviour.

## Accessibility
The label is associated with the control. Hint, error and a consumer-supplied `aria-describedby` relationship are combined. Error content sets `aria-invalid`. Disabled options remain unavailable through native behaviour.

## Usage guidance
Use Select for a known, reasonably sized list. Supply stable, meaningful option values and let the parent layout determine width.

## Anti-patterns
Do not use Select as an action menu, searchable combobox, arbitrary-content picker or replacement for a short visible Radio group.

## Related components
Use Radio for a short mutually exclusive list and DropdownMenu for actions. Combobox remains planned and has no public API.
