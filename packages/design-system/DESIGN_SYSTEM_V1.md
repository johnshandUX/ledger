# Ledger Design System v1

## Goal

Create a coherent first version of Ledger Design System that supports common commercial banking interfaces and can be represented consistently in code, Storybook and Figma.

The v1 system should be broad enough to support the first Ledger Bank screens without attempting to cover every future pattern.

## Foundations

Already established:

- colour
- typography
- spacing
- radius
- borders
- elevation

To add:

- minimal icon foundation using Lucide
  - information
  - success
  - warning
  - error

Additional icons should be introduced only when required by a component or demonstrated product need.

## Core components

Existing:

- Button
- Input
- Textarea
- Select
- Checkbox
- Radio

To add:

- Link
- Badge
- Alert
- Card
- Tabs
- Table
- Pagination
- Breadcrumb
- Modal
- Menu / Dropdown

## Form patterns

The component set should support:

- labels
- hint text
- validation messages
- required fields
- grouped form controls
- form sections

## Data and status patterns

The system should support common banking interface needs such as:

- status indicators
- tabular data
- account or transaction metadata
- warning and error messages
- actions associated with data rows

Do not create product-specific banking components yet.

## Excluded from v1

Do not create yet:

- account cards
- transaction rows
- payment summaries
- charts
- dashboards
- complex navigation
- date pickers
- file upload
- custom autocomplete
- rich data visualisation
- mobile-specific patterns
- dark theme

These should be introduced when Ledger Bank exposes a real requirement.

## Implementation expectations

Each component should:

- use existing Ledger tokens
- follow existing repository conventions
- use semantic HTML where possible
- have a small public API
- include Storybook stories
- include accessible interaction behaviour
- avoid speculative states and variants

## Review criteria

Ledger Design System v1 is complete when:

- all scoped components exist
- Storybook displays all supported variants
- components use Ledger foundations consistently
- no arbitrary colour values are introduced
- accessibility checks pass for normal usage
- the component set can support an initial Ledger Bank account-management screen
- component names and variants are ready to map into Figma