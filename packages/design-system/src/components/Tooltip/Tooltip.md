# Tooltip

## Purpose and anatomy

Tooltip provides brief supplementary text for an existing element. Its anatomy is the existing trigger plus one concise content bubble; both are required.

## Behaviour and accessibility

It opens on pointer hover and keyboard focus, closes on Escape, and uses the trigger's existing DOM element. Radix supplies the accessible tooltip relationship and timing. Motion is removed when reduced motion is requested.

## Usage guidance

Use Tooltip to clarify a compact or unfamiliar control. Keep content to a short phrase. Information required to understand or complete a task must remain visible in the interface; use form hint or validation text for form guidance.

Tooltip is non-interactive. Use Popover for contextual controls, or DropdownMenu for a set of actions. Do not place links, buttons, rich content, or essential instructions inside it.
