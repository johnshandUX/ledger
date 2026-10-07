# Ledger Design System v1

## Goal

Create a coherent first version of Ledger Design System that supports common commercial banking interfaces and can be represented consistently in code, Storybook and Figma.

The v1 system should be broad enough to support the first Ledger Bank screens without attempting to cover every future pattern.

## Historical scope and current result

This document records the original v1 scope. Current implementation and roadmap truth live in the
typed component manifest and component-family documentation. “Implemented” below describes the
current repository; “planned” does not define a public API.

## Foundations

Implemented in the original v1 baseline:

- colour
- typography
- spacing
- radius
- borders
- elevation

Implemented since the original plan:

- minimal icon foundation using Lucide
  - information
  - success
  - warning
  - error

Additional icons should be introduced only when required by a component or demonstrated product need.

## Core components

Implemented:

- Button
- Input
- Textarea
- Select
- Checkbox
- Radio

Implemented after the original v1 baseline:

- Link remains a `.ledger-link` visual convention; no React component is published
- Badge
- Alert
- Card
- Table
- Dialog and AlertDialog
- DropdownMenu
- Tooltip, Popover and Sheet
- Separator, Skeleton, Spinner and AspectRatio
- DataTable
- Progress and Avatar

Approved planned records, without public APIs:

- Tabs
- Pagination
- Breadcrumb
- Collapsible

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

Dark theme has since been implemented. Date controls and file upload now have approved planned
manifest records but remain unimplemented until their family specifications are reviewed. The
other exclusions remain evidence-led rather than implied public commitments.

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
