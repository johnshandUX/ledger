# Progress

## Purpose
Progress communicates the completion of a measurable operation or that an operation is underway when completion cannot be measured.

## Anatomy
A labelled progress root contains one visual indicator.

## Required and optional elements
`label` and `value` are required. Use a number from zero through `max` for determinate progress or `null` for indeterminate progress. `max` defaults to 100.

Standard `div` attributes such as `id`, `className`, `style`, data attributes and event handlers pass through. Radix-only composition and value-formatting props are intentionally not public.

## Behaviour
Determinate progress fills according to its value. Indeterminate progress moves within the track and becomes a static indicator under reduced motion.

Storybook exposes these states as the clearly named `Determinate`, `Indeterminate`, and `In Context` stories. The determinate specimen includes a visible percentage; the indeterminate specimen omits `aria-valuenow` and uses visible status text in the shared catalogue example.

## Accessibility
The required label gives the progressbar an accessible name. Radix supplies progressbar value semantics. Visible contextual text is still recommended for operations whose purpose is not obvious.

## Usage guidance
Use determinate progress only when a trustworthy value exists. Use indeterminate progress for bounded operations whose completion cannot yet be calculated.

## Anti-patterns
Do not invent status-colour variants, use invalid bounds, present an estimated value as exact, or use Progress as decoration.

## Related components
Use Spinner for compact indeterminate activity and Skeleton to reserve incoming content layout.
