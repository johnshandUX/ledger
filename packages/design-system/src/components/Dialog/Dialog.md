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
- Motion is disabled when the user prefers reduced motion.

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

Destructive confirmation belongs to a future Ledger `AlertDialog`, which will define stronger interruption and action conventions.
