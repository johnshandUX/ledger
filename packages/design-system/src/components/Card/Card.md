# Card

## Purpose
Card groups related content when a bounded surface materially improves comprehension or hierarchy.

## Anatomy
`Card` is the surface. `CardHeader`, `CardBody` and `CardFooter` provide optional ordered regions.

## Required and optional elements
Card children are required. Header, body and footer are optional and accept standard `div` attributes. Card has no visual variants.

## Behaviour
Card is responsive to its container and has no interaction or keyboard behaviour.

## Accessibility
Card adds no landmark or interactive semantics. Use native headings inside it and add an accessible name or sectioning element only when the surrounding document requires one. Actions inside a Card remain normal buttons or links.

## Usage guidance
Use for one coherent group with a realistic content hierarchy. Ledger uses borders and spacing rather than default elevation.

## Anti-patterns
Do not make the entire Card clickable, use it for every content block, introduce decorative variants or migrate product-specific cards without an approved contract.

## Related components
Use Alert for semantic feedback and Separator for boundaries that do not need a containing surface.
