import type { ReactNode } from "react";

export type DataTableDensity = "comfortable" | "compact";
export type DataTableRowTreatment = "plain" | "zebra";
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableStatus = "ready" | "loading" | "no-results" | "error";

export type DataTableSortableValue = string | number | boolean | Date | null | undefined;

export interface DataTableSortState {
  columnId: string;
  direction: DataTableSortDirection;
}

export interface DataTableState<TFilterId extends string = string> {
  sort?: DataTableSortState;
  /** Reserved for the later search slice. V1 consumers must pass an empty string. */
  query: string;
  /** Reserved for the later filter slice. V1 consumers must pass an empty object. */
  filters: Readonly<Partial<Record<TFilterId, readonly string[]>>>;
  pageIndex: number;
  pageSize: number;
}

export type DataTableStateChangeReason = "sort" | "page" | "page-size" | "data-change";

export interface DataTableStateChangeMeta {
  reason: DataTableStateChangeReason;
}

export interface DataTableCellContext<TData> {
  row: TData;
  rowId: string;
}

export interface DataTableColumn<TData> {
  id: string;
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
}

export interface DataTableStateContent {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export interface DataTableItemLabel {
  singular: string;
  plural: string;
}

export interface DataTableUncontrolledStateProps<TFilterId extends string = string> {
  state?: never;
  defaultState?: Partial<DataTableState<TFilterId>>;
  onStateChange?: (
    state: DataTableState<TFilterId>,
    meta: DataTableStateChangeMeta,
  ) => void;
}

export interface DataTableControlledStateProps<TFilterId extends string = string> {
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

export interface DataTableCommonProps<TData> {
  rows: readonly TData[];
  columns: readonly DataTableColumn<TData>[];
  getRowId: (row: TData) => string;
  caption: string;
  captionVisibility?: "visible" | "visually-hidden";
  density?: DataTableDensity;
  rowTreatment?: DataTableRowTreatment;
  pageSizeOptions?: readonly number[];
  /** Noun used to give visible and announced result counts domain context. */
  itemLabel?: DataTableItemLabel;
  status?: DataTableStatus;
  loadingLabel?: string;
  emptyState?: DataTableStateContent;
  noResultsState?: DataTableStateContent;
  errorState?: DataTableStateContent;
}

export type DataTableProps<TData, TFilterId extends string = string> =
  DataTableCommonProps<TData> & DataTableStateControl<TFilterId>;

export interface DataTableRowModel<TData, TFilterId extends string = string> {
  state: DataTableState<TFilterId>;
  sortedRows: readonly TData[];
  visibleRows: readonly TData[];
  totalRowCount: number;
  resultRowCount: number;
  pageCount: number;
}

export interface DataTableRowModelOptions<TData, TFilterId extends string = string> {
  rows: readonly TData[];
  columns: readonly DataTableColumn<TData>[];
  state: DataTableState<TFilterId>;
  pageSizeOptions?: readonly number[];
}
