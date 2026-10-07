# Radio

## Purpose
Radio selects one option from a mutually exclusive group using native browser behaviour.

## Anatomy
A native 24px radio input and visible clickable label are required. `name` should be shared by every option in the group. Adjacent Radio fields receive consistent vertical spacing when rendered as a group. Optional `hint` and `error` content are linked to the input.

## Behaviour
Selection and arrow-key movement remain native. Standard input attributes except `type` pass through. Error content marks the individual input invalid.

## Accessibility
The required label names the option. Hint and error identifiers are combined with any consumer-supplied `aria-describedby`; error takes precedence and sets `aria-invalid`, otherwise an explicit consumer value is preserved. Consumers must provide a group label, normally with `fieldset` and `legend`, and use the same `name` for all options. Preserve native focus and keyboard behaviour.

## Usage guidance
Use Radio when all available options can be shown and exactly one may be selected.

## Anti-patterns
Do not use isolated radio inputs without group context, use different names within one choice group or substitute Radio for an independent boolean choice.

## Related components
Use Checkbox for independent choices and Select when a longer fixed list should remain compact.
