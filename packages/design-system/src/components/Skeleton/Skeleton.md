# Skeleton

## Purpose

Skeleton reserves approximate layout while content is loading and reduces disruptive layout movement.

## Anatomy

A single decorative block shaped by its container or passed layout styles.

## Required and optional elements

No props are required. Standard `div` layout attributes, `className` and `style` may be used to describe the expected content shape. `children` and `aria-hidden` are intentionally excluded from the public API.

## Behaviour

Skeleton uses a restrained pulse animation. It becomes static when the user prefers reduced motion.

## Accessibility

Skeleton is always hidden from assistive technology. The containing loading region owns `aria-busy` and any accessible loading message. Do not put meaningful content inside a Skeleton.

## Usage guidance

Compose a small number of shapes that approximate the eventual layout. Keep dimensions local to the content example rather than adding speculative component variants.

## Anti-patterns

Do not announce each Skeleton, use it for indefinite background work, or reproduce every line of a complex screen.

## Related components

Use Spinner when progress should be visibly communicated without previewing the final layout.
