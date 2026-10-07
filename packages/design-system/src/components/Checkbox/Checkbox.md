# Checkbox

## Purpose
Checkbox toggles an independent choice while preserving native form behaviour.

## Anatomy
A native checkbox input and visible clickable label are required. Optional `hint` and `error` content are linked to the control. Standard input attributes except `type` pass through.

## Behaviour
The consumer may use controlled or uncontrolled native checkbox state. A supplied error marks the control invalid. The label expands the clickable target beyond the visible control.

## Accessibility
The required `label` provides the accessible name. Hint and error identifiers are combined with any consumer-supplied `aria-describedby`; error takes precedence and sets `aria-invalid`, otherwise an explicit consumer value is preserved. Preserve native Space-key activation and focus treatment.

## Usage guidance
Use Checkbox for independent choices or multiple selections. Group related choices with appropriate `fieldset` and `legend` semantics in the consuming form.

## Anti-patterns
Do not use Checkbox for a mutually exclusive choice, action command or immediate setting when a future Switch contract is more appropriate. Do not communicate error only by colour.

## Related components
Use Radio for one choice from a group and FormField to provide shared field state where its composition improves the form.
