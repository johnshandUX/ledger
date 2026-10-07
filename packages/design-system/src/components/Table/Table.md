# Table

## Purpose
Table provides server-safe semantic structure for tabular data.

## Anatomy
`Table` contains `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell`. Children are required for each primitive. `TableHeaderCell` defaults to column scope; header and data cells support left, centre and right alignment.

## Behaviour
Table is passive and has no client state or keyboard model. Native table semantics and consumer attributes are preserved. Products own captions, data, formatting, links and actions.

## Accessibility
Give each table an accessible name with `ariaLabel` or another valid native relationship. Use header cells with the correct scope. Do not recreate table structure with generic elements.

## Usage guidance
Use Table for static or bespoke tabular presentation. Keep headings concise and align numeric values consistently.

## Anti-patterns
Do not add sorting, filtering, pagination, row selection or loading behaviour to Table. Do not use a table for non-tabular layout.

## Related components
DataTable composes Table for implemented sorting, pagination, density, overflow and data-state behaviour. Future DataTable capabilities remain documented separately from its current API.
