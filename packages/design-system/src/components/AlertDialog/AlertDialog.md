# AlertDialog

## Purpose and anatomy

AlertDialog is Ledger's approved high-consequence confirmation. A visible `title`, `cancelAction`, and `action` are required by the component API. A description should explain the consequence or irreversibility; body content is optional.

## Behaviour and accessibility

Radix traps focus, assigns alert-dialog semantics, prevents outside-interaction dismissal, supports conventional Escape dismissal, and returns focus. Ledger owns the decision wrappers and footer so the required actions cannot be omitted accidentally.

## Usage guidance

Pass existing Ledger Buttons to `cancelAction` and `action`. Use the destructive Button variant for destructive confirmation. Give actions specific labels such as “Delete beneficiary”, not “Yes”. Use AlertDialog for destructive or materially consequential decisions; use Dialog for ordinary focused information or tasks.

Do not use it for acknowledgements, routine choices, or information that can be dismissed safely.
