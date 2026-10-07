# Input

## Purpose
Input collects a single-line value using a native input and Ledger's shared field structure.

## Anatomy
A `label` is required. Optional `hint`, `error` and `visuallyHiddenLabel` configure supporting content and presentation. Standard native input attributes pass through.

## Behaviour
Input supports controlled and uncontrolled native state and every appropriate input type. Labels remain visible by default. `visuallyHiddenLabel` hides only the visual presentation and preserves the accessible name.

Input shares the 1px resting, hover, focus, error, disabled and background semantic tokens used by Select and Textarea. The boundary remains subtly visible in both themes without changing geometry between states.

## Accessibility
The label is associated with the input. Hint, error and consumer-supplied description relationships are combined. Error content sets `aria-invalid`. Use a visually hidden label only where surrounding context makes a search control visually unambiguous.

## Usage guidance
Choose the correct native `type`, provide autocomplete metadata where useful and let the parent layout determine width.

## Anti-patterns
Do not use placeholder text as the accessible name, hide labels for ordinary fields, communicate validation only through colour or add action controls inside Input without an approved InputGroup contract.

## Related components
Use Textarea for multi-line content, Select for a fixed list and FormField for shared state composition. SearchField/InputGroup remains planned.
