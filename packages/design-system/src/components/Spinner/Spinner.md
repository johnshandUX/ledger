# Spinner

## Purpose

Spinner communicates that an operation is in progress when its duration or completion percentage is unknown.

## Anatomy

A single circular indicator in small, medium or large size.

## Required and optional elements

No props are required. `size` defaults to `medium`. Supply `label` when Spinner is the only accessible loading message.

## Behaviour

Spinner rotates continuously and inherits the current text colour. It becomes a static progress glyph when the user prefers reduced motion.

## Accessibility

Without `label`, Spinner is decorative and should sit beside visible loading text or inside a labelled busy region. With `label`, it exposes a named status. Avoid multiple live loading statuses for one operation.

## Usage guidance

Use for compact indeterminate work. Prefer visible text for operations whose meaning is not obvious.

## Anti-patterns

Do not use Spinner for determinate progress, as a decorative icon, or as the only indication that a disabled action is processing unless it has a label.

## Related components

Use Skeleton when preserving the shape of incoming content helps comprehension. Use Progress for measurable completion.
