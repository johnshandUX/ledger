# FormField

## Purpose
FormField composes shared label, helper, required, error and disabled state into a compatible Ledger control.

## Anatomy
`label` and one child are required. Optional `id`, `helperText`, `required`, `error`, `disabled` and `className` configure the field. A compatible child accepts Ledger's `label`, `hint`, `error` and native state props.

## Behaviour
FormField clones a valid child and supplies only values the child has not explicitly provided. Input, Textarea and Select derive their own accessible description IDs from the resulting content. Non-element children render unchanged.

FormField does not recreate control markup or styling. Its stories compose the actual Ledger Input, Select and Textarea components so their shared visual treatment cannot drift from the standalone controls.

## Accessibility
Use a compatible child that creates a native label relationship. Explicit child state takes precedence. FormField does not create grouping semantics; consumers still need `fieldset` and `legend` for grouped choices.

## Usage guidance
Use FormField when a surrounding form abstraction needs to provide consistent state to an existing Ledger control. Direct control props remain appropriate for simple fields.

## Anti-patterns
Do not wrap arbitrary markup and assume it gains field semantics, nest duplicate labels or use FormField to replace native group structure.

## Related components
Input, Textarea and Select are compatible text-based controls. Checkbox and Radio expose their own label, hint and error structure.
