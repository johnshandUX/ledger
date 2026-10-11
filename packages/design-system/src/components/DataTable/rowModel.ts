import type {
  DataTableColumn,
  DataTableFilterDefinition,
  DataTableRowModel,
  DataTableRowModelOptions,
  DataTableSearchDefinition,
  DataTableSortableValue,
  DataTableState,
} from "./DataTable.types";

const DEFAULT_PAGE_SIZE = 10;

function isNullish(value: DataTableSortableValue): value is null | undefined {
  return value == null;
}

function compareValues(left: DataTableSortableValue, right: DataTableSortableValue): number {
  if (isNullish(left) && isNullish(right)) return 0;
  if (isNullish(left)) return 1;
  if (isNullish(right)) return -1;
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  if (typeof left === "number" && typeof right === "number") return left - right;
  if (typeof left === "boolean" && typeof right === "boolean") return Number(left) - Number(right);
  return String(left).localeCompare(String(right), "en-GB", {
    numeric: true,
    sensitivity: "base",
  });
}

function normalizeDataTableSearchText(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
}

function normalizeFilters<TData, TFilterId extends string>(
  stateFilters: DataTableState<TFilterId>["filters"],
  definitions: readonly DataTableFilterDefinition<TData, TFilterId>[],
): DataTableState<TFilterId>["filters"] {
  const normalized: Partial<Record<TFilterId, readonly string[]>> = {};
  for (const definition of definitions) {
    const configuredValues = new Set(definition.options.map(({ value }) => value));
    const selected = [...new Set(stateFilters[definition.id] ?? [])]
      .filter((value) => configuredValues.has(value));
    if (selected.length > 0) normalized[definition.id] = selected;
  }
  return normalized;
}

function matchesSearch<TData>(row: TData, search: DataTableSearchDefinition<TData> | undefined, query: string): boolean {
  if (!search || query === "") return true;
  return search.values(row).some((value) => value != null && normalizeDataTableSearchText(value).includes(query));
}

function matchesFilters<TData, TFilterId extends string>(
  row: TData,
  definitions: readonly DataTableFilterDefinition<TData, TFilterId>[],
  selectedFilters: DataTableState<TFilterId>["filters"],
): boolean {
  return definitions.every((definition) => {
    const selected = selectedFilters[definition.id];
    if (!selected || selected.length === 0) return true;
    const rowValue = definition.values(row);
    const rowValues = rowValue == null ? [] : Array.isArray(rowValue) ? rowValue : [rowValue];
    return rowValues.some((value) => selected.includes(value));
  });
}

export function createDataTableRowModel<TData, TFilterId extends string = string>({
  rows,
  columns,
  state,
  search,
  filters = [],
  pageSizeOptions,
}: DataTableRowModelOptions<TData, TFilterId>): DataTableRowModel<TData, TFilterId> {
  const fallbackPageSize = pageSizeOptions?.[0] ?? DEFAULT_PAGE_SIZE;
  const pageSize = Number.isFinite(state.pageSize) && state.pageSize > 0 && (!pageSizeOptions || pageSizeOptions.includes(state.pageSize))
    ? state.pageSize
    : fallbackPageSize;
  const requestedPageIndex = Number.isFinite(state.pageIndex) && state.pageIndex >= 0
    ? Math.floor(state.pageIndex)
    : 0;
  const normalizedFilters = normalizeFilters(state.filters, filters);
  const normalizedQuery = normalizeDataTableSearchText(state.query);
  const filteredRows = rows.filter((row) =>
    matchesSearch(row, search, normalizedQuery) && matchesFilters(row, filters, normalizedFilters));
  const indexedRows = filteredRows.map((row, index) => ({ row, index }));
  const sortColumn = state.sort
    ? columns.find((column) => column.id === state.sort?.columnId && column.sort)
    : undefined;

  const sortedRows = sortColumn?.sort
    ? indexedRows
        .slice()
        .sort((left, right) => {
          if (sortColumn.sort?.compare) {
            const comparison = sortColumn.sort.compare(left.row, right.row);
            const directed = state.sort?.direction === "descending" ? -comparison : comparison;
            return directed || left.index - right.index;
          }
          const leftValue = sortColumn.sort?.value(left.row);
          const rightValue = sortColumn.sort?.value(right.row);
          const hasNullishValue = isNullish(leftValue) || isNullish(rightValue);
          const comparison = compareValues(leftValue, rightValue);
          const directed = state.sort?.direction === "descending" && !hasNullishValue ? -comparison : comparison;
          return directed || left.index - right.index;
        })
        .map(({ row }) => row)
    : filteredRows.slice();

  const totalRowCount = rows.length;
  const resultRowCount = sortedRows.length;
  const pageCount = resultRowCount === 0 ? 0 : Math.ceil(resultRowCount / pageSize);
  const finalPageIndex = Math.max(0, pageCount - 1);
  const pageIndex = Math.min(requestedPageIndex, finalPageIndex);
  const start = pageIndex * pageSize;
  const normalizedSort = sortColumn ? state.sort : undefined;

  return {
    state: { ...state, filters: normalizedFilters, sort: normalizedSort, pageIndex, pageSize },
    filteredRows,
    sortedRows,
    visibleRows: sortedRows.slice(start, start + pageSize),
    totalRowCount,
    resultRowCount,
    pageCount,
  };
}
