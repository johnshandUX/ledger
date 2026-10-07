# Avatar

## Purpose
Avatar represents a person or organisation with an image and resilient text fallback.

## Anatomy
A circular root contains a load-aware image and fallback text.

## Required and optional elements
`src`, `alt` and `fallback` are required. `size` defaults to `medium`; supported sizes are `small`, `medium` and `large`. `fallbackDelayMs` defaults to zero and may briefly delay fallback text when a reliable image is expected to load. Use an empty `alt` only when adjacent text already identifies the subject.

Standard `span` attributes such as `id`, `className`, `style`, data attributes and event handlers pass through. Radix composition props are intentionally not public because Avatar owns its image-and-fallback anatomy.

## Behaviour
Radix tracks image loading, shows the fallback while the image is unavailable or after it fails, then replaces it when the image loads. A configured delay avoids a brief fallback flash while a successful image request completes.

## Accessibility
The root keeps the same image role and accessible name across loading, loaded and fallback states; its nested image is hidden from the accessibility tree to avoid duplicate announcements. When `alt` is empty, the whole Avatar is decorative and adjacent text must identify the subject. Fallback text should be short initials or an established abbreviation.

## Usage guidance
Use the smallest size that remains legible in its context. Treat the source image and fallback text as product-owned content.

## Anti-patterns
Do not add presence, status badges, groups or editable-image behaviour to this foundation component.

## Related components
Badge can communicate status beside an Avatar, but should not be built into it.
