# DropdownMenu

## Purpose and anatomy

DropdownMenu is a compact action list associated with a required trigger. Content contains one or more `DropdownMenuItem` elements; separators are optional.

## Behaviour and accessibility

Radix provides menu semantics, roving keyboard focus, typeahead, Escape/outside-click dismissal, and focus return. Disabled items cannot be selected. The trigger and every action need a clear accessible name.

## Usage guidance

Order frequent and low-risk actions first. Place destructive actions last, separate them when useful, and use `intent="destructive"`. Destructive intent uses the same error semantics as Ledger's destructive Button. It is a visual warning only; irreversible actions must open AlertDialog for explicit confirmation.

Do not put arbitrary forms or substantial content in a menu. Use Popover for mixed contextual controls and Sheet or Dialog for larger tasks.
