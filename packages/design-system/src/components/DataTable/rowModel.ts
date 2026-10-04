import type {
  DataTableColumn,
  DataTableRowModel,
  DataTableRowModelOptions,
  DataTableSortableValue,
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

export function createDataTableRowModel<TData, TFilterId extends string = string>({
  rows,
  columns,
  state,
  pageSizeOptions,
}: DataTableRowModelOptions<TData, TFilterId>): DataTableRowModel<TData, TFilterId> {
  const fallbackPageSize = pageSizeOptions?.[0] ?? DEFAULT_PAGE_SIZE;
  const pageSize = Number.isFinite(state.pageSize) && state.pageSize > 0 && (!pageSizeOptions || pageSizeOptions.includes(state.pageSize))
    ? state.pageSize
    : fallbackPageSize;
  const requestedPageIndex = Number.isFinite(state.pageIndex) && state.pageIndex >= 0
    ? Math.floor(state.pageIndex)
    : 0;
  const indexedRows = rows.map((row, index) => ({ row, index }));
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
    : rows.slice();

  const totalRowCount = sortedRows.length;
  const pageCount = totalRowCount === 0 ? 0 : Math.ceil(totalRowCount / pageSize);
  const finalPageIndex = Math.max(0, pageCount - 1);
  const pageIndex = Math.min(requestedPageIndex, finalPageIndex);
  const start = pageIndex * pageSize;
  const normalizedSort = sortColumn ? state.sort : undefined;

  return {
    state: { ...state, sort: normalizedSort, pageIndex, pageSize },
    sortedRows,
    visibleRows: sortedRows.slice(start, start + pageSize),
    totalRowCount,
    resultRowCount: totalRowCount,
    pageCount,
  };
}
