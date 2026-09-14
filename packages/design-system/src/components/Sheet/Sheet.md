# Sheet

## Purpose and anatomy

Sheet presents supporting content or a contextual task from the viewport edge while retaining visual page context. The underlying page is not interactive while the modal Sheet is open. A visible `title` is required. Description, scrollable `SheetBody`, footer actions, and `SheetClose` are optional; the labelled close control is shown by default.

## Behaviour and accessibility

Ledger intentionally supports only left and right placement, defaulting to right. Radix supplies modal focus trapping, Escape/outside-click dismissal, accessible title/description relationships, and focus return. Body content scrolls independently so footer actions stay available.

## Usage guidance

Use Sheet when the relationship with the underlying page remains useful and more space is needed than a Popover provides. Use Dialog for a compact centred task demanding focus, AlertDialog for consequential confirmation, and a full page for complex or multi-step work.

Do not hide the title visually, use a Sheet as primary navigation, or place a full-page workflow inside it.
