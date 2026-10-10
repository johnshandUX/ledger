"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu/DropdownMenu";
import { Icon } from "../Icon/Icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../Table";
import { createDataTableRowModel } from "./rowModel";
import type {
  DataTableColumn,
  DataTableProps,
  DataTableState,
  DataTableStateChangeReason,
  DataTableStateContent,
} from "./DataTable.types";
import "./DataTable.css";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function resolveInitialState<TFilterId extends string>(
  defaultState: Partial<DataTableState<TFilterId>> | undefined,
  pageSizeOptions: readonly number[],
): DataTableState<TFilterId> {
  return {
    query: defaultState?.query ?? "",
    filters: defaultState?.filters ?? ({} as DataTableState<TFilterId>["filters"]),
    sort: defaultState?.sort,
    pageIndex: defaultState?.pageIndex ?? 0,
    pageSize: defaultState?.pageSize ?? pageSizeOptions[0] ?? DEFAULT_PAGE_SIZE,
  };
}

function StateContent({ content, role = "status" }: { content: DataTableStateContent; role?: "alert" | "status" }) {
  return (
    <div className="ledger-data-table__state" role={role}>
      <strong>{content.title}</strong>
      {content.description && <div className="ledger-data-table__state-description">{content.description}</div>}
      {content.action && <div className="ledger-data-table__state-action">{content.action}</div>}
    </div>
  );
}

function validateConfiguration<TData>(
  rows: readonly TData[],
  columns: readonly DataTableColumn<TData>[],
  getRowId: (row: TData) => string,
  pageSizeOptions: readonly number[],
) {
  if (pageSizeOptions.length === 0 || pageSizeOptions.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("DataTable pageSizeOptions must contain positive finite values.");
  }
  if (pageSizeOptions.some((value, index) => index > 0 && value <= pageSizeOptions[index - 1])) {
    throw new Error("DataTable pageSizeOptions must be ascending and duplicate-free.");
  }
  const columnIds = columns.map((column) => column.id);
  if (new Set(columnIds).size !== columnIds.length) throw new Error("DataTable column IDs must be unique.");
  const rowIds = rows.map(getRowId);
  if (new Set(rowIds).size !== rowIds.length) throw new Error("DataTable row IDs must be unique.");
}

function getResultText(pageIndex: number, pageSize: number, resultCount: number) {
  if (resultCount <= pageSize) return `${resultCount}`;
  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, resultCount);
  return `${start}–${end} of ${resultCount}`;
}

function getResultAnnouncement(resultText: string, resultCount: number, itemLabel: { singular: string; plural: string }) {
  return `Showing ${resultText} ${resultCount === 1 ? itemLabel.singular : itemLabel.plural}`;
}

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

function getPaginationItems(pageIndex: number, pageCount: number): PaginationItem[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index);
  const items: PaginationItem[] = [0];
  const start = Math.max(1, pageIndex - 1);
  const end = Math.min(pageCount - 2, pageIndex + 1);
  if (start > 1) items.push("ellipsis-start");
  for (let index = start; index <= end; index += 1) items.push(index);
  if (end < pageCount - 2) items.push("ellipsis-end");
  items.push(pageCount - 1);
  return items;
}

export function DataTable<TData, TFilterId extends string = string>({
  rows,
  columns,
  getRowId,
  caption,
  captionVisibility = "visually-hidden",
  density = "comfortable",
  rowTreatment = "plain",
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = { singular: "result", plural: "results" },
  status = "ready",
  loadingLabel = "Loading data",
  emptyState = { title: "No data to display" },
  noResultsState = { title: "No matching results" },
  errorState = { title: "Data could not be loaded" },
  state: controlledState,
  defaultState,
  onStateChange,
}: DataTableProps<TData, TFilterId>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isHorizontallyScrollable, setIsHorizontallyScrollable] = useState(false);
  const [columnWidths, setColumnWidths] = useState<readonly number[]>([]);
  useMemo(() => {
    if (import.meta.env.DEV || import.meta.env.MODE === "test") {
      validateConfiguration(rows, columns, getRowId, pageSizeOptions);
    }
  }, [rows, columns, getRowId, pageSizeOptions]);
  const [uncontrolledState, setUncontrolledState] = useState<DataTableState<TFilterId>>(() =>
    resolveInitialState(defaultState, pageSizeOptions),
  );
  const state = controlledState ?? uncontrolledState;

  const rowModel = useMemo(
    () => createDataTableRowModel({ rows, columns, state, pageSizeOptions }),
    [rows, columns, state, pageSizeOptions],
  );
  const effectiveState = rowModel.state;

  const updateState = (nextState: DataTableState<TFilterId>, reason: DataTableStateChangeReason) => {
    if (controlledState === undefined) setUncontrolledState(nextState);
    onStateChange?.(nextState, { reason });
  };

  useEffect(() => {
    if (state.pageIndex !== effectiveState.pageIndex || state.pageSize !== effectiveState.pageSize || state.sort !== effectiveState.sort) {
      updateState(effectiveState, "data-change");
    }
  }, [effectiveState.pageIndex, effectiveState.pageSize, effectiveState.sort, state]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateOverflow = () => setIsHorizontallyScrollable(viewport.scrollWidth > viewport.clientWidth);
    updateOverflow();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(viewport);
    const table = viewport.querySelector("table");
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, [columns, rows]);

  const handleSort = (column: DataTableColumn<TData>) => {
    if (!column.sort) return;
    const isCurrent = effectiveState.sort?.columnId === column.id;
    const direction = isCurrent
      ? effectiveState.sort?.direction === "ascending" ? "descending" : "ascending"
      : column.sort.initialDirection ?? "ascending";
    updateState({ ...effectiveState, sort: { columnId: column.id, direction }, pageIndex: 0 }, "sort");
  };

  const handlePageSize = (pageSize: number) => {
    updateState({ ...effectiveState, pageSize, pageIndex: 0 }, "page-size");
  };

  const isEmpty = status === "ready" && rows.length === 0;
  const showsState = status !== "ready" || isEmpty;
  const resultText = getResultText(effectiveState.pageIndex, effectiveState.pageSize, rowModel.resultRowCount);
  const itemNoun = rowModel.resultRowCount === 1 ? itemLabel.singular : itemLabel.plural;
  const resultAnnouncement = getResultAnnouncement(resultText, rowModel.resultRowCount, itemLabel);
  const visibleResultText = `${resultText} ${itemNoun}`;
  const paginationItems = getPaginationItems(effectiveState.pageIndex, rowModel.pageCount);
  const hasEffectivePageSizeChoice = pageSizeOptions.some((pageSize) => pageSize < rowModel.resultRowCount);

  useLayoutEffect(() => {
    const headerCells = viewportRef.current?.querySelectorAll<HTMLTableCellElement>("thead th");
    if (!headerCells || headerCells.length !== columns.length) return;
    setColumnWidths(Array.from(headerCells, (cell) => cell.getBoundingClientRect().width));
  }, [columns]);

  return (
    <div
      className="ledger-data-table"
      data-density={density}
      data-row-treatment={rowTreatment}
      aria-busy={status === "loading" || undefined}
    >
      <div
        ref={viewportRef}
        className="ledger-data-table__viewport"
        role={isHorizontallyScrollable ? "region" : undefined}
        aria-label={isHorizontallyScrollable ? `${caption} table` : undefined}
        tabIndex={isHorizontallyScrollable ? 0 : undefined}
      >
        <Table>
          <caption className={captionVisibility === "visually-hidden" ? "ledger-data-table__caption--visually-hidden" : "ledger-data-table__caption"}>
            {caption}
          </caption>
          {columnWidths.length === columns.length && (
            <colgroup>
              {columns.map((column, index) => <col key={column.id} style={{ width: columnWidths[index] }} />)}
            </colgroup>
          )}
          <TableHead>
            <TableRow>
              {columns.map((column) => {
                const sortDirection = effectiveState.sort?.columnId === column.id ? effectiveState.sort.direction : undefined;
                return (
                  <TableHeaderCell
                    key={column.id}
                    align={column.headerAlign ?? column.align}
                    aria-sort={column.sort ? sortDirection ?? "none" : undefined}
                    className={[
                      column.sort ? "ledger-data-table__header--sortable" : "",
                      (column.headerAlign ?? column.align) === "right" ? "ledger-data-table__header--right" : "",
                      column.nowrap ? "ledger-data-table__cell--nowrap" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {column.sort ? (
                      <button
                        type="button"
                        className="ledger-data-table__sort-button"
                        onClick={() => handleSort(column)}
                        aria-label={`Sort by ${column.label}${sortDirection ? `, currently ${sortDirection}` : ""}`}
                      >
                        <span className="ledger-data-table__sort-content">
                          <span>{column.header}</span>
                          <Icon
                            name={sortDirection === "ascending" ? "arrow-up" : sortDirection === "descending" ? "arrow-down" : "sort"}
                            size="small"
                            className="ledger-data-table__sort-indicator"
                          />
                        </span>
                      </button>
                    ) : column.header}
                  </TableHeaderCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {!showsState && rowModel.visibleRows.map((row) => {
              const rowId = getRowId(row);
              return (
                <TableRow key={rowId}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      className={[
                        column.numeric ? "ledger-data-table__cell--numeric" : "",
                        column.nowrap ? "ledger-data-table__cell--nowrap" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {column.cell({ row, rowId })}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {showsState && (
        status === "error" ? <StateContent content={errorState} role="alert" />
          : status === "loading" ? <StateContent content={{ title: loadingLabel }} />
          : status === "no-results" ? <StateContent content={noResultsState} />
          : <StateContent content={emptyState} />
      )}

      {!showsState && (
        <div className="ledger-data-table__footer">
          <div className="ledger-data-table__pagination">
            <span className="ledger-data-table__result-status" role="status" aria-live="polite" aria-atomic="true">
              {resultAnnouncement}
            </span>
            {hasEffectivePageSizeChoice ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ledger-data-table__range-trigger"
                    aria-label={`${resultAnnouncement}. Change rows per page`}
                  >
                    <span>{visibleResultText}</span>
                    <Icon name="chevron-down" size="small" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="ledger-data-table__page-size-menu">
                  {pageSizeOptions.map((pageSize) => (
                    <DropdownMenuItem
                      key={pageSize}
                      className="ledger-data-table__page-size-option"
                      role="menuitemradio"
                      aria-label={`Show ${pageSize} results per page`}
                      aria-checked={pageSize === effectiveState.pageSize}
                      data-current={pageSize === effectiveState.pageSize || undefined}
                      onSelect={() => handlePageSize(pageSize)}
                    >
                      {pageSize} results
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : <span className="ledger-data-table__result-count" aria-hidden="true">{visibleResultText}</span>}
            {rowModel.pageCount > 1 && (
              <>
                {effectiveState.pageIndex > 0 && (
                  <button
                    type="button"
                    className="ledger-data-table__page-control"
                    aria-label="Previous page"
                    onClick={() => updateState({ ...effectiveState, pageIndex: effectiveState.pageIndex - 1 }, "page")}
                  ><Icon name="chevron-left" size="small" /></button>
                )}
                {paginationItems.map((item) => typeof item === "number" ? (
                  <button
                    key={item}
                    type="button"
                    className="ledger-data-table__page-control"
                    aria-label={`Page ${item + 1}`}
                    aria-current={item === effectiveState.pageIndex ? "page" : undefined}
                    onClick={() => updateState({ ...effectiveState, pageIndex: item }, "page")}
                  >{item + 1}</button>
                ) : <span key={item} className="ledger-data-table__page-ellipsis" aria-hidden="true">…</span>)}
                {effectiveState.pageIndex < rowModel.pageCount - 1 && (
                  <button
                    type="button"
                    className="ledger-data-table__page-control"
                    aria-label="Next page"
                    onClick={() => updateState({ ...effectiveState, pageIndex: effectiveState.pageIndex + 1 }, "page")}
                  ><Icon name="chevron-right" size="small" /></button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
