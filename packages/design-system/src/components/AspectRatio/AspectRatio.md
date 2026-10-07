# AspectRatio

## Purpose

AspectRatio reserves a predictable responsive shape for media or other visual content.

## Anatomy

A single wrapper containing consumer-owned content.

## Required and optional elements

`ratio` and `children` are required. Ratio is expressed as width divided by height, such as `16 / 9` or `1`.

## Behaviour

The wrapper fills its available width and uses native CSS `aspect-ratio`. It does not set child sizing, media fit or overflow; the consumer owns those presentation choices.

## Accessibility

AspectRatio adds no semantics. Child media retains responsibility for alternative text, captions, titles and controls.

## Usage guidance

Use where a stable media footprint improves responsive layout. Select a ratio based on the content rather than decoration.

## Anti-patterns

Do not use invalid or arbitrary ratios or rely on the wrapper to size, crop or label embedded content.

## Related components

AspectRatio may be composed inside future Card or media patterns without becoming responsible for those components' structure.
