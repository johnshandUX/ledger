# Dialog

## Purpose

Dialog presents a temporary, focused task or information that needs attention while preserving the context of the underlying page.

## Anatomy

- `Dialog` controls open state and Radix dialog behaviour.
- `DialogTrigger` opens the dialog.
- `DialogContent` requires a visible `title` and provides the modal surface and default close control.
- `description` is optional and supplements the title when more context is useful.
- `DialogBody` contains optional task or informational content and provides bounded scrolling.
- `DialogFooter` contains all actions.
- `DialogClose` allows an action component to dismiss the dialog.

## Behaviour

- The close icon is shown by default.
- Escape dismisses the dialog.
- Focus remains trapped while the dialog is open and returns appropriately after dismissal.
- Long body content scrolls within the available viewport while footer actions remain available.
- `mobileFullScreen` preserves the centred desktop dialog and switches to a safe-area-aware, full-viewport surface at mobile widths.
- Motion is disabled when the user prefers reduced motion.
- `DialogTrigger` supports `asChild`, allowing a Ledger Button or a semantic native button with a text-style presentation. Opening a dialog is an action, not navigation.

## Actions

- Use existing Ledger components for actions.
- Place every action in `DialogFooter`.
- Put a secondary action immediately before the primary action; the primary action appears on the right.
- Keep the action set small and directly related to the focused task.

## Accessibility

- Provide a concise, visible title through the required `title` prop.
- Use `description` when the title alone does not adequately explain the dialog.
- Preserve the accessible relationships, focus management and keyboard behaviour supplied by the underlying Radix primitive.
- Keep the default close control's accessible label meaningful if it is customised.
- Do not remove visible focus treatment.

## Usage guidance

Use Dialog when a focused interaction can be completed without navigating away from the current page context.

Do not use Dialog:

- for destructive confirmation
- for complex multi-step journeys
- as a substitute for a full page when the task needs substantial space or surrounding context
- for passive information that does not warrant interrupting the user

Destructive or materially consequential confirmation belongs to the implemented Ledger `AlertDialog`, which requires explicit cancel and action elements.

## Mobile full-screen form layout

Use `mobileFullScreen` when a focused form needs the available mobile viewport while retaining the established desktop dialog treatment. Compose the dialog as three regions:

1. **Header:** `DialogContent` owns the top-aligned title, description and close control at their natural height.
2. **Content:** place fields in `DialogBody`. Content is top-aligned, uses semantic spacing tokens and scrolls independently when it exceeds the available height.
3. **Footer:** place actions in `DialogFooter`. The footer remains bottom-anchored and the full-screen surface accounts for mobile safe-area insets.

Form fields must never be distributed vertically to fill the viewport. Surplus space belongs below the form content, not between fields. Keep each label, control, hint and validation message in its field component so their relationship and spacing remain intact. Insert conditional fields directly after the control that reveals them; they should expand the content naturally without changing spacing between unrelated fields.

Preserve normal document-order keyboard navigation, focus management and visible focus. The content region must remain scrollable when the on-screen keyboard reduces the dynamic viewport, and focused controls must not be obscured by the footer. Do not use fixed field heights, arbitrary margins or a separate mobile form implementation to simulate this structure.
