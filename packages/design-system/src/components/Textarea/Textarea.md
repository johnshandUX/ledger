# Textarea

## Purpose
Textarea collects multi-line text using native form semantics.

## Anatomy
A visible `label` is required. Optional `hint` and `error` content are linked to the native textarea. Standard textarea attributes pass through.

## Behaviour
Textarea is responsive to its container and remains vertically resizable. Consumers may use controlled or uncontrolled state. Error content sets invalid state without changing the native value model.

Textarea uses the same 1px semantic boundary, control background and state-token treatment as Input and Select.

## Accessibility
The label names the control. Generated hint and error relationships are combined with a consumer-supplied `aria-describedby`. Preserve visible focus and do not use placeholder text as the only label.

## Usage guidance
Use Textarea for longer free-form content. Set an appropriate row count or allow the default practical height, and provide guidance when format or visibility matters.

## Anti-patterns
Do not use Textarea for single-line values, disable resizing without a product reason or communicate validation only through colour.

## Related components
Use Input for single-line values and FormField when shared field-state composition is useful.
