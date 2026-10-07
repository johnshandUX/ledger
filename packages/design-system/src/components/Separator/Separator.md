# Separator

## Purpose

Separator creates a visual or semantic boundary between adjacent groups of content.

## Anatomy

A single horizontal rule or vertical span. It has no child content.

## Required and optional elements

No props are required. `orientation` defaults to `horizontal`. `decorative` defaults to `true`; set it to `false` only when the boundary is meaningful to assistive technology.

## Behaviour

Separator is static and has no keyboard behaviour. Horizontal separators fill their container width. Vertical separators stretch to the cross-axis size supplied by their layout context.

## Accessibility

Decorative separators are hidden from assistive technology. Semantic separators expose the separator role and orientation. Prefer headings and native section structure when those describe the content relationship more accurately.

## Usage guidance

Use between related regions whose boundary needs reinforcement. Ensure a vertical separator has a parent layout that gives it a useful height.

## Anti-patterns

Do not use Separator as decoration throughout every surface, as a replacement for spacing, or to represent application state.

## Related components

`DropdownMenuSeparator` remains specific to DropdownMenu and is not replaced by this component.
