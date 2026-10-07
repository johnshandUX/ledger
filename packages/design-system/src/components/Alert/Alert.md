# Alert

## Purpose
Alert presents important static feedback that needs more attention than inline helper text.

## Anatomy
`Alert` is the status surface. Informational, success, warning and error alerts include the corresponding decorative Ledger status icon. `AlertTitle` provides an optional visual heading and `AlertDescription` provides optional supporting content.

## Required and optional elements
Alert children are required. `variant` defaults to `neutral`; supported values are `neutral`, `informational`, `success`, `warning` and `error`. Title and description are optional compositional elements.

## Behaviour
Alert is static, non-dismissible and has no keyboard behaviour.

## Accessibility
Alert does not create a live region automatically. Static page content normally needs no role. Set `role="status"` for a newly inserted polite update or `role="alert"` only for an urgent dynamic message. The status icon is decorative and hidden from assistive technology because the visible title and description carry the meaning. `AlertTitle` is a visual title; use a native heading around or inside the content when document hierarchy requires one.

## Usage guidance
Use for important information, confirmation, warnings, errors or action-required context.

## Anti-patterns
Do not use as advertising, a decorative card, a toast, a dismissible notification or a universal urgent announcement.

## Related components
Use Badge for compact status and Card for neutral content grouping.
