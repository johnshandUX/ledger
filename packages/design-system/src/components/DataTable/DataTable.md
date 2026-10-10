# DataTable

> Status: the foundation slice is implemented. Search/filtering, selection/bulk actions and column
> management are the approved priority order for later slices. Future sections describe direction,
> not current props, exports or supported behaviour.

## Purpose

DataTable helps users find, scan, compare, sort, filter and extract information from structured
datasets. It is a product-agnostic interaction pattern composed from Ledger's structural `Table`
primitive and other Ledger controls.

DataTable is appropriate when users need to work with a collection rather than merely read a small
static table. A consuming experience supplies the dataset, domain-specific columns, filters,
formatting, links and actions. DataTable supplies consistent interaction, state presentation and
table behavior.

DataTable is not an editable spreadsheet, a responsive-card generator or a domain-specific banking
component.

## Component boundary

### Table responsibilities

`Table` remains the server-safe structural primitive. It owns:

- native `table`, `thead`, `tbody`, `tr`, `th` and `td` semantics
- base table typography, cell spacing, borders and alignment
- passive row and cell presentation
- low-level composition for static or bespoke tables

Table does not own sorting, filtering, pagination, copy behavior, loading states, row navigation,
selection or responsive alternatives. DataTable must compose Table rather than reproduce its
semantic elements or base visual rules where practical.

### Implemented DataTable responsibilities

`DataTable` is the interactive, client-side pattern. It owns:

- rendering configured columns and rows through Table
- sortable-header controls for explicitly sortable columns
- client-side stable sorting for explicitly sortable columns
- page navigation, page size and result summaries
- comfortable and compact density
- optional zebra row treatment, independently of density
- a deliberate horizontal-overflow viewport
- consistent loading, empty, no-results and error presentation
- accessible names, relationships, focus treatment and status feedback for its own controls

DataTable does not own domain rules, data fetching, routing, authorization, currency choice,
responsive card content or product-specific filter definitions.

### Product responsibilities

Product and domain implementations own:

- source data and stable row identity
- column and filter configuration
- domain formatting and missing-value semantics
- links and actions rendered inside cells
- fetching, caching, retry and stale-response handling
- URL or navigation-state synchronization
- alternative responsive representations such as `AccountCard`
- ensuring equivalent records, ordering, important fields and actions across representations

## Implemented public package boundary

DataTable requires client state, layout measurement and browser observers. It is published from a
dedicated client entry:

```ts
import {
  DataTable,
  createDataTableRowModel,
  type DataTableColumn,
  type DataTableProps,
  type DataTableState,
} from "@johnshandux/ledger-design-system/data-table";
```

The package's root entry remains safe for Server Component consumers.

### Implemented exports and props

The dedicated entry currently exports `DataTable`, `createDataTableRowModel` and the types defined
in `DataTable.types.ts`. The implemented component accepts:

- `rows`, `columns`, `getRowId` and `caption`
- visible or visually hidden caption presentation
- controlled or uncontrolled sort and page state
- `comfortable` or `compact` density
- `plain` or `zebra` row treatment
- ascending, duplicate-free page-size options
- optional singular and plural `itemLabel` copy for domain-contextual result counts
- `ready`, `loading`, `no-results` and `error` presentation
- consumer-supplied loading, empty, no-results and error content

The current state type retains `query` and `filters` as reserved serialisable fields. Consumers must
pass an empty string and empty object; no search or filtering behaviour is implemented. Current
columns support rendering, alignment, numeric/nowrap presentation and optional sorting. They do
not support copy, selection, visibility, ordering, pinning or resizing.

## Archived full-family proposal and future direction — not API reference

The remainder of this document preserves the original reviewed full-family proposal so later
slices retain their design rationale. Some passages overlap behaviour that the foundation slice
has since implemented; other passages describe unimplemented search, filtering, copy, sticky-header
and server-mode behaviour. This archive is not authoritative for current props or exports.
Consumers must use the implemented summary above and the types exported from
`@johnshandux/ledger-design-system/data-table`. Do not copy types or infer support from this
proposal.

## Archived proposed TypeScript contract

The public API must not use `any`. Row callbacks remain typed to the consumer's data type. Rendered
content is deliberately separate from values used for sorting, filtering and copying.

```ts
import type { ReactNode } from "react";

export type DataTableDensity = "comfortable" | "compact";
export type DataTableRowTreatment = "plain" | "zebra";
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableStatus = "ready" | "loading" | "no-results" | "error";

export type DataTableSortableValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export interface DataTableSortState {
  columnId: string;
  direction: DataTableSortDirection;
}

export interface DataTableState<TFilterId extends string = string> {
  sort?: DataTableSortState;
  query: string;
  filters: Readonly<Partial<Record<TFilterId, readonly string[]>>>;
  pageIndex: number;
  pageSize: number;
}

export type DataTableStateChangeReason =
  | "sort"
  | "query"
  | "filter"
  | "clear-filters"
  | "page"
  | "page-size"
  | "data-change";

export interface DataTableStateChangeMeta {
  reason: DataTableStateChangeReason;
}

export interface DataTableCellContext<TData> {
  row: TData;
  rowId: string;
}

export interface DataTableColumn<TData> {
  /** Stable identifier used by state and future column features. */
  id: string;
  /** Plain-text name used by controls and accessible labels. */
  label: string;
  header: ReactNode;
  cell: (context: DataTableCellContext<TData>) => ReactNode;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  numeric?: boolean;
  nowrap?: boolean;
  sort?: {
    value: (row: TData) => DataTableSortableValue;
    compare?: (left: TData, right: TData) => number;
    initialDirection?: DataTableSortDirection;
  };
  copy?: {
    value: (row: TData) => string;
    label: (row: TData) => string;
  };
}

export interface DataTableFilterOption {
  value: string;
  label: string;
}

export interface DataTableFilterDefinition<
  TData,
  TFilterId extends string = string,
> {
  id: TFilterId;
  label: string;
  options: readonly DataTableFilterOption[];
  values: (row: TData) => string | readonly string[];
}

export interface DataTableSearchDefinition<TData> {
  label: string;
  placeholder?: string;
  values: (row: TData) => readonly string[];
}

export interface DataTableStateContent {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export interface DataTableUncontrolledStateProps<
  TFilterId extends string = string,
> {
  state?: never;
  defaultState?: Partial<DataTableState<TFilterId>>;
  onStateChange?: (
    state: DataTableState<TFilterId>,
    meta: DataTableStateChangeMeta,
  ) => void;
}

export interface DataTableControlledStateProps<
  TFilterId extends string = string,
> {
  state: DataTableState<TFilterId>;
  defaultState?: never;
  onStateChange: (
    state: DataTableState<TFilterId>,
    meta: DataTableStateChangeMeta,
  ) => void;
}

export type DataTableStateControl<TFilterId extends string = string> =
  | DataTableUncontrolledStateProps<TFilterId>
  | DataTableControlledStateProps<TFilterId>;

export interface DataTableCommonProps<
  TData,
  TFilterId extends string = string,
> {
  rows: readonly TData[];
  columns: readonly DataTableColumn<TData>[];
  getRowId: (row: TData) => string;
  /** Textual table name used by the caption and overflow-region relationship. */
  caption: string;
  captionVisibility?: "visible" | "visually-hidden";
  filters?: readonly DataTableFilterDefinition<TData, TFilterId>[];
  search?: DataTableSearchDefinition<TData>;
  density?: DataTableDensity;
  rowTreatment?: DataTableRowTreatment;
  stickyHeader?: boolean;
  pageSizeOptions?: readonly number[];
  status?: DataTableStatus;
  loadingLabel?: string;
  emptyState?: DataTableStateContent;
  noResultsState?: DataTableStateContent;
  errorState?: DataTableStateContent;
}

export type DataTableProps<
  TData,
  TFilterId extends string = string,
> =
  | (DataTableCommonProps<TData, TFilterId> &
      DataTableStateControl<TFilterId> & {
        mode?: "client";
      })
  | (DataTableCommonProps<TData, TFilterId> &
      DataTableControlledStateProps<TFilterId> & {
      mode: "server";
      /** All records before the current search and filter state. */
      totalRowCount: number;
      /** All records matching the current search and filter state. */
      resultRowCount: number;
    });

export interface DataTableRowModel<TData> {
  filteredRows: readonly TData[];
  sortedRows: readonly TData[];
  visibleRows: readonly TData[];
  totalRowCount: number;
  resultRowCount: number;
  pageCount: number;
}

export interface DataTableRowModelOptions<
  TData,
  TFilterId extends string = string,
> {
  rows: readonly TData[];
  columns: readonly DataTableColumn<TData>[];
  filters?: readonly DataTableFilterDefinition<TData, TFilterId>[];
  search?: DataTableSearchDefinition<TData>;
  state: DataTableState<TFilterId>;
}

export function createDataTableRowModel<
  TData,
  TFilterId extends string = string,
>(
  options: DataTableRowModelOptions<TData, TFilterId>,
): DataTableRowModel<TData>;
```

Passing both `state` and `defaultState` is invalid. When `state` is supplied, `onStateChange` is
required. Server mode always requires controlled state. The unions make invalid combinations fail
at compile time.

## Column definitions

Every column has a stable, consumer-defined `id`. IDs must remain stable across renders and must not
be derived from the visible header. They form the state key for sorting and provide the future
identity needed by sticky columns, column visibility and column ordering.

Every column also has a plain-text `label`. Unlike the renderable `header`, `label` is safe for sort
controls, copy feedback and accessible names. Labels must be unique enough to distinguish columns
within one DataTable.

`cell` renders visible content from the typed row. It must not be inspected by DataTable to derive
sort, filter or copy values.

A column's `sort.value` must return one consistent non-nullish value type for every row. Mixing
strings, numbers, booleans or dates within one column is invalid configuration; nullish values may
still represent missing data.

`numeric` applies Ledger's tabular-numeral convention. Numeric content should normally also be
right-aligned. `nowrap` is appropriate for short identifiers, dates and amounts whose meaning would
be harmed by wrapping. It must not be applied indiscriminately to descriptive text.

The first implementation does not expose arbitrary per-column pixel widths. Wide-data behavior is
owned by the overflow contract. A future sizing API must be based on demonstrated datasets and must
not introduce an ungoverned set of visual values.

### Sortable and non-sortable columns

A column is non-sortable unless it defines `sort`. Non-sortable headers are passive and must not
look or behave like buttons.

For a sortable column:

- `value` returns the raw value used by the default comparator.
- `compare` is optional and replaces the default comparator when domain-specific ordering is needed.
- `compare(left, right)` defines ascending order using the conventional negative, zero and positive
  return values; DataTable reverses its result for descending order.
- a custom comparator owns its complete value ordering, including nullish values.
- the default comparator places nullish values after non-nullish values in both directions, compares
  numbers and dates by value, booleans as `false` before `true`, and strings with one documented
  Ledger locale/collation policy rather than browser-dependent implicit coercion.
- `initialDirection` controls the first direction selected from an unsorted state.
- activating a different sortable column replaces the current sort; multi-column sorting is not in
  the first scope
- activating the current column toggles ascending and descending
- clearing back to an unsorted state is not part of the default header cycle; consumers can restore
  their default state through an external reset action
- sorting must be stable, using original input order as the final tie-break
- nullish ordering must be consistent and documented by the implementation

Formatted currency, dates and identifiers must sort by appropriate raw values rather than their
display strings.

## Search and filters

Search is optional and configured through `search`. DataTable searches only the strings returned by
the consumer's `values` function. It must not serialize complete row objects or inspect rendered
cells. Initial matching is case-insensitive and substring-based using a documented normalization
strategy.

Filters are optional and configured independently from columns. This allows a product to define
domain filters such as status, account type and currency without requiring a corresponding visible
column.

Filter behavior is:

- each filter has a stable ID, label and finite option list
- state stores selected option values by filter ID
- multiple selected values within one filter use OR semantics
- selections across different filters use AND semantics
- search and configured filters use AND semantics
- an absent filter key and an empty selection both mean that filter is inactive
- unknown filter IDs or option values must not be silently introduced by uncontrolled state
- a row value not represented by the configured options matches no active option; it remains visible
  when that filter is inactive
- changing search or filters resets `pageIndex` to `0`

DataTable owns the consistent control layout, active-filter count, removable active-filter
presentation and clear-all action. The consumer owns filter labels, option labels and row values.
The first version uses option-based filters; free-form ranges and date intervals require a future
filter-definition extension rather than overloading option values.

An active-filter summary must include search when a non-empty query is applied. Clearing all resets
query and filter selections but does not reset density, page size or the current sort.

## Pagination, page size and result counts

DataTable uses zero-based `pageIndex` in state and presents one-based page numbers to users.

- Initial page size uses `state.pageSize`, then `defaultState.pageSize`, then the first supplied
  `pageSizeOptions` value, then the Ledger default of `10`.
- Consumers may provide a non-empty, ascending, duplicate-free `pageSizeOptions` list.
- The current page size must be one of those options.
- Changing page size resets to the first page.
- Search and filter changes reset to the first page.
- When row or count changes make a page invalid, DataTable clamps to the final valid page.
- Pagination controls are omitted when there is only one page, but result count remains available.
- Page navigation changes the table rows without moving focus into the table body automatically.
- The visible result range is a link-like menu trigger. It uses the optional `itemLabel` noun,
  defaulting to `result`/`results`, so consumers can present context such as `1–10 of 200 accounts`. Its
  menu lists the configured page sizes as `{size} results`; choosing one applies the page size and
  returns to the first page. Options use
  radio-menu semantics so the current page size is exposed programmatically. When no configured
  page size can change the presented rows, the result count is passive rather than a false control.
- Previous and next use icon-only chevron controls with accessible names and Ledger-sized touch
  targets. Previous is omitted on the first page and next is omitted on the last page. Available
  page numbers are direct controls; large page sets use non-interactive ellipses.
- The current page uses `aria-current="page"` and a visual selected treatment.
- Result changes are announced through a dedicated status region outside the page-size trigger.
  The visible range, status announcement and accessible control names use the same item noun so
  the quantities retain context for all users.

Result text uses three distinct quantities: total rows before search/filter, matching rows after
search/filter, and the one-based range on the visible page. Canonical forms are:

- unfiltered, unpaginated: `24`
- unfiltered, paginated: `1–10 of 24`
- filtered, unpaginated: `8 matching results from 24 total`
- filtered, paginated: `1–8 of 8 matching results from 24 total`
- no matches: `0 matching results from 24 total`
- empty source: no result summary; show the empty state

Counts must be based on the authoritative client row model or server-provided counts, never inferred
from rendered DOM rows. Search counts as filtering for result-summary purposes.

## Table colour roles

DataTable defines component-semantic theme roles because the same meanings recur across tables:

- `--ledger-color-table-border` for row and header separators
- `--ledger-color-table-header-surface` for the header row
- `--ledger-color-table-header-hover` for sortable-header hover
- `--ledger-color-table-row-zebra` for alternating rows

These roles map to governed neutral primitives in each appearance. Components consume the roles;
they do not select light- or dark-specific values. The dark table border is intentionally subtler
than the general-purpose border token.

Header labels use the small body size, regular weight and secondary text colour so row data remains
the primary content. A sortable header's button fills the entire header cell and uses Ledger's
`sort`, `arrow-up` and `arrow-down` icons.

## Copyable values

Copy behavior is opt-in per column through `copy`; ordinary cells are never automatically copyable.

- `value` returns the exact plain text written to the clipboard.
- `label` provides a value-specific accessible action name, for example `Copy account number for
  Operating account`.
- the copy action is a dedicated native button inside the cell
- the whole cell and row must not become copy targets
- copying does not select or navigate the row
- decorative copy icons are hidden from assistive technology
- success and failure receive visible feedback and restrained live-region announcements
- Clipboard API rejection must be handled without reporting success
- formatted display and copied value may differ deliberately; for example, a grouped visual account
  number may copy an unspaced canonical value

Copy state is transient interaction state owned by DataTable and is not part of `DataTableState`.

## Density and row treatment

`density` has a small semantic API:

- `comfortable` is the default and provides the standard scanning and touch-target treatment.
- `compact` reduces vertical cell space for information-dense commercial datasets while preserving
  legibility, focus visibility and usable interactive targets.

Density changes spacing, not font family, semantic hierarchy or dataset content.

`rowTreatment` is independent:

- `plain` is the default base row treatment.
- `zebra` adds alternating row surfaces to support scanning where appropriate.

Compact does not imply zebra, and zebra does not imply compact. Neither option makes rows
interactive. Zebra styling must use semantic surface tokens and retain sufficient contrast in every
supported appearance.

## Horizontal overflow

DataTable owns a named overflow viewport around the composed Table. Overflow must not be applied to
the `<table>` element itself.

- Wide datasets retain an intrinsic minimum width rather than compressing every column until
  content becomes unreadable.
- After the initial intrinsic layout, DataTable records the resolved column widths for the life of
  that mounted table. Sorting and paging therefore do not reflow columns. Content that exceeds a
  recorded width may still expand its column and the overflow viewport rather than overlap or clip.
- The viewport scrolls horizontally without clipping focus indicators or interactive controls.
- Native scrolling is preferred. The viewport has no landmark role and no forced tab stop while it
  is not scrollable.
- When horizontal overflow exists, the implementation must make the content keyboard-scrollable on
  supported browsers. If this requires `tabIndex="0"`, the viewport receives `role="region"` and an
  accessible name derived from the table caption. It must not create a second labelled region when
  native browser behavior already makes the overflow area operable.
- Overflow indicators or shadows, if later approved, must use Ledger semantic tokens and cannot be
  the only indication that more content exists.
- Responsive layout must not hide configured columns automatically.

## Sticky headers and future sticky columns

`stickyHeader` keeps column headers visible within DataTable's scroll viewport. A sticky header must
have an opaque semantic background, retain its border and sorting focus treatment, and use a local
stacking context sufficient for the table. It must not introduce a new global z-index system.

The intended first behavior is for headers to stick during document/page scrolling while DataTable
remains in view. This behavior is provisional: horizontal overflow can establish a containing
scrollport that prevents document-scroll sticky positioning. Before `stickyHeader` is implemented or
published, a small semantic HTML/CSS spike must verify the behavior in supported browsers without
duplicating table semantics or breaking horizontal scrolling. If it cannot, this contract must be
revised and approved with an explicit internally scrolling viewport and governed height API. The
implementation must not silently ship a partially working sticky option.

Sticky columns are deliberately not implemented in the first version. The architecture must still
preserve a path by:

- requiring stable column IDs
- keeping column order explicit
- keeping overflow and sticky behavior inside one owned viewport
- avoiding transforms or clipping that prevent sticky positioning
- reserving the possibility of leading utility columns for future selection
- allowing future sticky-column cells to receive opaque backgrounds and boundary treatment

A future sticky-column API must define collision behavior between sticky headers and columns,
directionality, stacking, shadows or borders, and narrow-viewport fallbacks before implementation.

## Data and state behavior

### Client mode

Client mode receives the complete source collection and applies this deterministic pipeline:

```text
source rows -> search -> configured filters -> stable sort -> pagination -> visible rows
```

`createDataTableRowModel` is a pure, typed helper using the same configuration and state as
DataTable. It exists so a consumer can produce an equivalent product-owned representation, such as
mobile cards, without duplicating processing rules.

The helper must not read browser state or mutate source rows. It returns filtered, sorted and
visible row collections plus authoritative counts.

### Server mode

Server mode establishes the future remote-data path. In this mode:

- `rows` contains the already searched, filtered, sorted and paged records supplied by the consumer
- DataTable must not process `rows` again
- `totalRowCount` and `resultRowCount` are authoritative
- page count is derived from `resultRowCount` and controlled `pageSize`
- state changes notify the consumer, which owns requests and loading transitions
- request cancellation, stale-response protection, caching and errors belong to the consumer

The first implementation may demonstrate server mode without introducing a data-fetching adapter.
Cursor-based pagination is outside the first contract and would require a separate pagination-state
extension rather than disguising cursors as page indices.

### Controlled and uncontrolled state

DataTable supports two complete modes, not independently mixed controlled slices.

In uncontrolled mode, omit `state`, provide optional `defaultState`, and let DataTable own query,
filters, sort, page and page size. `onStateChange` may observe changes.

In controlled mode, provide the complete `state` and required `onStateChange`. DataTable calculates
the next complete state and reports it with a reason; the consumer decides when to commit it.

Controlled mode is required when state is synchronized with a URL, drives server requests or must
also control a separate responsive representation. Controlled and uncontrolled modes must have the
same visible behavior.

### State validation and normalization

Component configuration errors should fail during development rather than produce ambiguous UI.
Duplicate column IDs, duplicate filter IDs, duplicate filter-option values, empty or unsorted page
size options, non-positive page sizes, and an initial sort targeting a missing or non-sortable
column are invalid configuration.

Externally controlled state can become stale as data or configuration changes. DataTable and
`createDataTableRowModel` therefore apply the same deterministic normalization without mutating the
provided object:

- unknown sort columns remove the active sort
- unknown filter IDs and unknown option values are ignored
- empty filter selections are removed
- query is preserved as supplied; trimming applies to matching, not stored state
- negative or non-finite page indices normalize to `0`
- a page index beyond the final page clamps to the final valid page, or `0` when no page exists
- a missing, non-finite or non-positive page size uses the initialization fallback
- a page size absent from `pageSizeOptions` uses the first configured option

In development, normalization should also produce a clear diagnostic for malformed controlled
state. In production it remains deterministic and non-throwing because URL state, permissions and
server configuration may legitimately become stale. When normalization changes effective state,
DataTable reports the normalized complete state with reason `data-change`; consumers must avoid
creating update loops. The pure row-model helper returns results from normalized state but performs
no callback.

## Loading, empty, no-results and error states

States are distinct and mutually understandable:

State precedence is `error`, then `loading`, then `empty`, then `no results`, then ready data.
Error and initial loading replace the data body and suppress pagination and result summaries while
preserving the caption and surrounding layout. During a background server refresh, previously
successful rows may remain visible only when the consumer continues to supply them; the region is
marked busy and controls that would create conflicting requests may be disabled. This background
refresh must not be announced as an empty or no-results state.

Empty and no-results render within the DataTable region in place of data rows. Search/filter controls
are hidden for an empty source, retained for no-results, and retained during an error only when they
remain useful for recovery. The semantic column headers may remain visible to preserve context and
layout, but placeholder state content must not masquerade as a data row. Pagination is hidden for
empty, no-results, loading and error states.

### Loading

Loading means the current dataset or server result is pending. DataTable retains stable surrounding
layout where practical, marks the relevant region busy, and exposes a concise loading label. It
must not present stale result counts as current. Skeleton rows, if used, are non-interactive and
hidden from the table's data semantics.

### Empty

Empty means the authoritative unfiltered dataset contains no records. Search, filter and pagination
controls are not useful and should not be presented as though they can reveal data. The consumer
provides domain-appropriate title, description and optional action content.

### No results

No results means records exist but the current search or filters match none. Active controls remain
available and DataTable provides a clear-all route. Consumer content may explain the domain context,
but it must not replace the clear mechanism.

In the foundation slice, `status="no-results"` exists only to establish this presentation and its
accessibility semantics. DataTable does not infer no-results from reserved query/filter state until
client-side search and filtering are implemented.

### Error

Error means the requested dataset could not be presented. The consumer owns the error explanation
and any retry action. DataTable supplies consistent state placement and accessibility. An error must
not be rendered as an empty dataset.

In server mode, the consumer supplies status and counts consistently. `resultRowCount: 0` is not by
itself enough to distinguish empty from no-results; DataTable also evaluates whether query or filter
state is active and the authoritative `totalRowCount`.

## Responsive responsibilities

DataTable does not automatically convert to cards, lists or another representation at a breakpoint.
Its responsive behavior is limited to preserving a usable table through intentional horizontal
overflow and configured wrapping behavior.

The consuming experience may render an alternative such as `AccountCard`. DataTable V1 remains
responsible only for the tabular representation. The product owns alternative markup, breakpoints,
controls and interaction orchestration.

Products may use `createDataTableRowModel` to apply equivalent client-side processing rules, but V1
does not provide an alternative renderer, controller, slot, copy bridge or shared responsive-state
API. A shared table/card abstraction must wait for multiple real product use cases.

When a product renders both representations, it remains responsible for equivalent records,
ordering, domain meaning, important fields and actions, and for ensuring hidden duplicate content is
not exposed to assistive technology.

## Accessibility requirements

- Use native table semantics. DataTable must not use `role="grid"` because its cells are not
  editable and it does not provide application-style two-dimensional keyboard navigation.
- Every DataTable has a caption. It may be visible or visually hidden but must provide a useful name.
- Header cells retain appropriate `scope` relationships.
- Sortable headers contain native buttons; non-sortable headers remain passive.
- The sorted header exposes `aria-sort` on its `th`. Visual icons supplement rather than replace the
  accessible state.
- Sort controls have descriptive accessible names, visible focus and keyboard activation.
- Search and filter controls have persistent accessible labels.
- Active-filter removal and clear-all actions are native buttons with specific names.
- Pagination exposes current page, available page actions and descriptive previous/next labels.
- Status announcements for results, loading completion and copy feedback are concise and not
  needlessly repeated.
- Error content is announced appropriately without forcing disruptive focus movement.
- Horizontal overflow does not clip focus indicators or make content unreachable by keyboard.
- Sticky headers do not obscure focused content.
- Color is not the only means of conveying sorting, filtering, error or active state.
- Interactive controls inside cells remain separate focus targets. DataTable does not add a row-level
  click or keyboard handler.
- Reduced-motion preferences are respected by any optional state or feedback transitions.

## Deliberately out of scope

The first DataTable version does not include:

- row selection
- bulk actions
- editable cells or inline editing
- column reordering
- show/hide column configuration
- saved views
- export
- multi-column sorting
- sticky columns
- column resizing
- virtualization
- tree rows or grouped rows
- expandable detail rows
- cursor-based pagination
- automatic responsive cards
- row-level navigation

Editable tables are a separate future pattern. They must not be introduced by adding edit callbacks
to DataTable cells.

## Future extension boundaries

The first contract avoids speculative public props but preserves these extension points:

### Row selection

Stable `getRowId` identity and explicit column order allow a future leading selection column.
Selection state must be separate from navigation and must define selection across pages and server
datasets before being added.

### Bulk actions

Bulk actions depend on an approved selection model. They should occupy a dedicated action region and
must not be encoded as ordinary filters or pagination controls.

### Column configuration

Stable column IDs allow future visibility and ordering state. A future feature must define required
columns, identifying columns, persistence, responsive behavior and sticky-column interaction.

### Saved views

The serializable state model provides a basis for saved query, filter, sort, pagination and future
column preferences. Saved-view storage, naming, permissions, migration and ownership remain product
concerns.

### Export

Export must operate on explicit raw/domain values and an explicit scope such as current page,
filtered results or complete server dataset. It must not scrape formatted DOM content. Server-side
export orchestration remains a product concern.

These possibilities do not justify adding dormant selection, action, visibility, persistence or
export props to the first implementation.

## Example: simple generic DataTable

```tsx
"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@johnshandux/ledger-design-system/data-table";

type Person = {
  id: string;
  name: string;
  team: string;
  email: string;
};

const columns: readonly DataTableColumn<Person>[] = [
  {
    id: "name",
    label: "Name",
    header: "Name",
    cell: ({ row }) => row.name,
    sort: { value: row => row.name },
  },
  {
    id: "team",
    label: "Team",
    header: "Team",
    cell: ({ row }) => row.team,
    // Deliberately not sortable.
  },
  {
    id: "email",
    label: "Email",
    header: "Email",
    cell: ({ row }) => row.email,
    copy: {
      value: row => row.email,
      label: row => `Copy email address for ${row.name}`,
    },
  },
];

export function PeopleTable({ people }: { people: readonly Person[] }) {
  return (
    <DataTable
      caption="People"
      rows={people}
      columns={columns}
      getRowId={person => person.id}
      search={{
        label: "Search people",
        values: person => [person.name, person.team, person.email],
      }}
      density="comfortable"
      rowTreatment="plain"
      pageSizeOptions={[10, 25, 50]}
      emptyState={{ title: "No people to display" }}
      noResultsState={{
        title: "No matching people",
        description: "Try changing your search or filters.",
      }}
    />
  );
}
```

## Example: Ledger Bank Accounts

The account configuration belongs to Ledger Bank. DataTable does not import account types or
financial formatting rules.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrencyAmount } from "@johnshandux/ledger-design-system";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilterDefinition,
  type DataTableState,
} from "@johnshandux/ledger-design-system/data-table";
import type { Account } from "../src/domain/Account";
import { formatAccountType } from "../src/presentation/accountDetail";

type AccountFilterId = "status" | "accountType" | "currency";

const accountColumns: readonly DataTableColumn<Account>[] = [
  {
    id: "account",
    label: "Account",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <Link className="ledger-link" href={`/accounts/${row.id}`}>
          {row.name}
        </Link>
        {row.description && <div>{row.description}</div>}
      </div>
    ),
    sort: { value: row => row.name },
  },
  {
    id: "accountNumber",
    label: "Account number",
    header: "Number / Sort",
    nowrap: true,
    cell: ({ row }) => (
      <div>
        <div>{row.accountNumber}</div>
        <div>{row.sortCode}</div>
      </div>
    ),
    copy: {
      value: row => row.accountNumber,
      label: row => `Copy account number for ${row.name}`,
    },
  },
  {
    id: "type",
    label: "Account type",
    header: "Type",
    cell: ({ row }) => formatAccountType(row.type),
  },
  {
    id: "currentBalance",
    label: "Current balance",
    header: "Current",
    align: "right",
    headerAlign: "right",
    numeric: true,
    cell: ({ row }) => formatCurrencyAmount(row.currentBalance, row.currency),
    sort: { value: row => row.currentBalance },
  },
  {
    id: "availableBalance",
    label: "Available balance",
    header: "Available",
    align: "right",
    headerAlign: "right",
    numeric: true,
    cell: ({ row }) => formatCurrencyAmount(row.availableBalance, row.currency),
    sort: { value: row => row.availableBalance },
  },
];

const accountFilters: readonly DataTableFilterDefinition<
  Account,
  AccountFilterId
>[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "restricted", label: "Restricted" },
      { value: "closed", label: "Closed" },
    ],
    values: account => account.status,
  },
  {
    id: "accountType",
    label: "Account type",
    options: [
      { value: "current", label: "Current" },
      { value: "reserve", label: "Reserve" },
    ],
    values: account => account.type,
  },
  {
    id: "currency",
    label: "Currency",
    options: [
      { value: "GBP", label: "GBP" },
      { value: "EUR", label: "EUR" },
      { value: "USD", label: "USD" },
    ],
    values: account => account.currency,
  },
];

const initialState: DataTableState<AccountFilterId> = {
  query: "",
  filters: {},
  sort: { columnId: "account", direction: "ascending" },
  pageIndex: 0,
  pageSize: 20,
};

export function AccountsDataView({ accounts }: { accounts: readonly Account[] }) {
  const [state, setState] = useState(initialState);

  return (
    <DataTable
      caption="Accounts"
      rows={accounts}
      columns={accountColumns}
      getRowId={account => account.id}
      filters={accountFilters}
      search={{
        label: "Search accounts",
        values: account => [
          account.name,
          account.description ?? "",
          account.accountNumber,
          account.sortCode,
        ],
      }}
      state={state}
      onStateChange={(nextState, metadata) => {
        setState(nextState);
        // metadata.reason is available for URL synchronization or analytics.
      }}
      density="comfortable"
      rowTreatment="plain"
      stickyHeader
      pageSizeOptions={[10, 20, 50]}
      emptyState={{ title: "No accounts to display" }}
      noResultsState={{
        title: "No matching accounts",
        description: "Try changing your search or filters.",
      }}
    />
  );
}
```

The example intentionally keeps account links, financial formatting and filter vocabulary in the
Bank application. Controlled state remains appropriate for future URL synchronization. The public
row-model helper remains available if a product later needs to apply the same processing rules to an
independently owned alternative representation; DataTable V1 does not orchestrate that view.

## Usage guidance

Use DataTable when users need to interact with a structured dataset through at least one of search,
filters, sorting, pagination or value extraction.

Continue to use Table directly for small, static or highly bespoke tabular content that does not
need the DataTable interaction model.

Do not use DataTable:

- as a page-layout grid
- for editable spreadsheet behavior
- when a simple list communicates the content more clearly
- to conceal product-specific logic inside the design system
- to make an entire row simultaneously selectable and navigable
- to force desktop table structure into a product's mobile card design

## Documentation and review requirements

Implementation must include stories and tests for supported public behavior rather than recreating
the component with custom markup. Human review must cover hierarchy, density, wide-data scrolling,
sticky headers, sorting affordance, filtering, pagination, state presentation, focus treatment,
light and dark appearances, and product-owned responsive equivalence.

This component family requires a corresponding Figma definition for anatomy, density, row treatment,
sorting, filtering, pagination, copy affordance, overflow, sticky headers and data states before the
implementation is considered complete.
