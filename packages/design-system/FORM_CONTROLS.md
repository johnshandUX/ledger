# Ledger Form Controls

This document defines the shared visual and interaction rules for Ledger form controls.

It applies to:

- Input
- Textarea
- Select
- Checkbox
- Radio

These controls should feel like one coherent family across code, Storybook and Figma.

---

## 1. General principles

Ledger form controls should be:

- clear
- accessible
- spacious
- modern
- restrained
- consistent
- appropriate for professional banking interfaces

Controls should prioritise legibility, strong affordance and predictable interaction over decorative styling.

Native HTML semantics and behaviour should be preserved wherever possible.

---

## 2. Field structure

Text-based form controls should follow a common field structure:

1. Label
2. Optional hint
3. Control
4. Optional error message

Spacing between these elements should use existing Ledger spacing tokens.

Labels should use Ledger typography and the standard text colour.

Hint text should use the secondary text colour.

Error text should use the Ledger error colour.

---

## 3. Border treatment

Interactive form controls should use a 2px border by default.

Use:

`--ledger-border-width-thick`

The default border colour should use:

`--ledger-color-border`

Focus treatment should remain clearly visible and should not rely on colour alone.

Controls should not use a 1px border as their default interactive boundary unless explicitly justified.

---

## 4. Radius

Text-based form controls should use:

`--ledger-radius-medium`

Checkbox and Radio may use geometry appropriate to their native control shape.

---

## 5. Control height

Single-line text inputs and Select controls should have a minimum height of approximately 44px.

The exact height may be determined by:

- border width
- typography
- vertical padding
- box sizing

Controls should not appear visually cramped.

---

## 6. Padding

Text-based controls should use generous internal spacing.

As a default:

- vertical padding should use `--ledger-space-2`
- horizontal padding should use `--ledger-space-3`

Controls may use larger spacing where required by the component.

Arbitrary padding values should not be introduced when Ledger spacing tokens are suitable.

---

## 7. Typography

Text entered or selected within form controls should use Ledger body typography.

Use:

- `--ledger-font-family-sans`
- `--ledger-font-size-body`
- `--ledger-font-weight-regular`
- `--ledger-line-height-body`

Labels should use:

- `--ledger-font-weight-semibold`

Hint and error text should use:

- `--ledger-font-size-body-small`

---

## 8. Width behaviour

Form controls should not assume an unnecessarily narrow fixed width.

Input, Select and Textarea should support responsive layouts.

As a default:

- controls should use `width: 100%`
- parent layouts should determine the final field width
- Storybook examples should demonstrate controls at a realistic form width

Do not hard-code a narrow component width purely for demonstration purposes.

---

## 9. Input

Input should:

- use the standard field structure
- use the shared 2px control border
- use medium radius
- use Ledger typography
- maintain a minimum height of approximately 44px
- support label, hint and error states

---

## 10. Textarea

Textarea should:

- follow the same visual language as Input
- use the shared 2px control border
- use medium radius
- use Ledger typography
- use responsive width
- have a practical default vertical size for multi-line content
- remain manually resizable vertically unless there is a clear product reason to prevent it

Storybook should demonstrate Textarea at a realistic form width.

---

## 11. Select

Select should use the native HTML `<select>` element for semantics and behaviour.

Its visual appearance should be styled to match Ledger rather than relying on the browser's default presentation.

Select should:

- use the shared 2px control border
- use medium radius
- use Ledger typography
- use generous horizontal padding
- have a minimum height consistent with Input
- use a deliberate Ledger-compatible dropdown indicator
- preserve native keyboard and form behaviour
- use responsive width

Select is a form control for choosing a value from a defined list.

It is not the same as an action menu or dropdown menu.

---

## 12. Checkbox

Checkbox should use a native checkbox input.

The native control may be visually styled while preserving its native form and accessibility behaviour.

Checkbox should:

- have a clear visible boundary
- use a strong selected state
- avoid appearing visually tiny
- maintain comfortable spacing between control and label
- make the label clickable
- ensure the interactive target is not limited to the visible control; the associated label should provide a larger clickable area
- maintain visible keyboard focus
- avoid clipping at any state
- use a checked indicator that is visually prominent within the control and clearly distinguishable at normal viewing sizes

The visual control should be approximately 20px in size unless testing shows a different size is more appropriate.

---

## 13. Radio

Radio should use a native radio input.

The native control may be visually styled while preserving its native form and accessibility behaviour.

Radio should:

- have a clear visible circular boundary
- use a strong selected state
- maintain comfortable spacing between control and label
- make the label clickable
- support native arrow-key navigation within a radio group
- maintain visible keyboard focus
- avoid clipping at any state
- use a selected indicator that is visually prominent within the control and clearly distinguishable at normal viewing sizes; the inner dot should occupy enough of the control to communicate selection clearly without dominating the outer boundary

The visual control should be approximately 20px in size unless testing shows a different size is more appropriate.

---

## 14. Focus

All interactive controls must expose a clear visible focus state.

Focus styling should:

- be visually distinct from the default border
- remain visible against white and neutral surfaces
- work consistently across the form-control family
- not rely solely on subtle colour change

---

## 15. Storybook representation

Storybook examples should present controls at realistic dimensions.

Text-based controls should not be shown at artificially narrow widths unless the story is explicitly demonstrating constrained or responsive behaviour.

Each component should include stories for the supported states relevant to that component.

---

## 16. Figma parity

Equivalent Figma components should follow the same rules for:

- border width
- radius
- control height
- padding
- typography
- state treatment
- control sizing
- responsive width behaviour

The code and Figma representations should describe the same component family rather than independently interpreting form-control styling.