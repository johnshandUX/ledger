"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu/DropdownMenu";
import { Icon } from "../Icon/Icon";
import { Input } from "../Input/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../Popover/Popover";
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
  DataTableFilterDefinition,
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

function StateContent({ content, role = "status" }: { content: DataTableStateContent; role?: "alert" | "status" | "none" }) {
  return (
    <div className="ledger-data-table__state" role={role === "none" ? undefined : role}>
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
  filters: readonly DataTableFilterDefinition<TData, string>[],
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
  const filterIds = filters.map(({ id }) => id);
  if (new Set(filterIds).size !== filterIds.length) throw new Error("DataTable filter IDs must be unique.");
  for (const filter of filters) {
    const optionValues = filter.options.map(({ value }) => value);
    if (new Set(optionValues).size !== optionValues.length) {
      throw new Error(`DataTable filter option values must be unique within filter "${filter.id}".`);
    }
  }
}

function getResultText(
  pageIndex: number,
  pageSize: number,
  resultCount: number,
  totalCount: number,
  itemLabel: { singular: string; plural: string },
  filtered: boolean,
) {
  const noun = resultCount === 1 ? itemLabel.singular : itemLabel.plural;
  if (filtered) {
    if (resultCount <= pageSize) return `${resultCount} matching ${noun} from ${totalCount} total`;
    const start = pageIndex * pageSize + 1;
    const end = Math.min(start + pageSize - 1, resultCount);
    return `${start}–${end} of ${resultCount} matching ${itemLabel.plural} from ${totalCount} total`;
  }
  if (resultCount <= pageSize) return `${resultCount}`;
  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, resultCount);
  return `${start}–${end} of ${resultCount}`;
}

function addResultNoun(resultText: string, resultCount: number, itemLabel: { singular: string; plural: string }) {
  const includesNoun = resultText.includes(itemLabel.singular) || resultText.includes(itemLabel.plural);
  return `${resultText}${includesNoun ? "" : ` ${resultCount === 1 ? itemLabel.singular : itemLabel.plural}`}`;
}

function getResultAnnouncement(resultText: string, resultCount: number, itemLabel: { singular: string; plural: string }) {
  return `Showing ${addResultNoun(resultText, resultCount, itemLabel)}`;
}

function filtersEqual<TFilterId extends string>(
  left: DataTableState<TFilterId>["filters"],
  right: DataTableState<TFilterId>["filters"],
) {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => {
    if (key !== rightKeys[index]) return false;
    const leftValues = left[key as TFilterId] ?? [];
    const rightValues = right[key as TFilterId] ?? [];
    return leftValues.length === rightValues.length && leftValues.every((value, valueIndex) => value === rightValues[valueIndex]);
  });
}

function sortEqual(left: DataTableState["sort"], right: DataTableState["sort"]) {
  return left?.columnId === right?.columnId && left?.direction === right?.direction;
}

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

type FilterControlProps<TData, TFilterId extends string> = {
  definition: DataTableFilterDefinition<TData, TFilterId>;
  filterIndex: number;
  instanceId: string;
  selected: readonly string[];
  onChange: (filterId: TFilterId, optionValue: string, checked: boolean) => void;
};

function FilterControl<TData, TFilterId extends string>({
  definition,
  filterIndex,
  instanceId,
  selected,
  onChange,
}: FilterControlProps<TData, TFilterId>) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover>
      <PopoverTrigger ref={triggerRef} className="ledger-data-table__filter-trigger">
        <span>{definition.label}{selected.length > 0 ? ` (${selected.length})` : ""}</span>
        <Icon name="chevron-down" size="small" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent
        accessibleLabel={`${definition.label} options`}
        align="start"
        className="ledger-data-table__filter-popover"
      >
        <fieldset>
          <legend>{definition.label}</legend>
          {definition.options.map((option, optionIndex) => (
            <Checkbox
              key={option.value}
              id={`${instanceId}-filter-${filterIndex}-option-${optionIndex}`}
              label={option.label}
              checked={selected.includes(option.value)}
              onChange={(event) => onChange(definition.id, option.value, event.currentTarget.checked)}
            />
          ))}
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}

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
  search,
  filters = [],
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
  const instanceId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isHorizontallyScrollable, setIsHorizontallyScrollable] = useState(false);
  const [columnWidths, setColumnWidths] = useState<readonly number[]>([]);
  useMemo(() => {
    if (import.meta.env.DEV || import.meta.env.MODE === "test") {
      validateConfiguration(rows, columns, getRowId, filters, pageSizeOptions);
    }
  }, [rows, columns, getRowId, filters, pageSizeOptions]);
  const [uncontrolledState, setUncontrolledState] = useState<DataTableState<TFilterId>>(() =>
    resolveInitialState(defaultState, pageSizeOptions),
  );
  const state = controlledState ?? uncontrolledState;

  const rowModel = useMemo(
    () => createDataTableRowModel({ rows, columns, state, search, filters, pageSizeOptions }),
    [rows, columns, state, search, filters, pageSizeOptions],
  );
  const effectiveState = rowModel.state;

  const updateState = (nextState: DataTableState<TFilterId>, reason: DataTableStateChangeReason) => {
    if (controlledState === undefined) setUncontrolledState(nextState);
    onStateChange?.(nextState, { reason });
  };

  useEffect(() => {
    if (state.pageIndex !== effectiveState.pageIndex
      || state.pageSize !== effectiveState.pageSize
      || !sortEqual(state.sort, effectiveState.sort)
      || !filtersEqual(state.filters, effectiveState.filters)) {
      updateState(effectiveState, "data-change");
    }
  }, [effectiveState, state]);

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

  const handleQuery = (query: string) => {
    updateState({ ...effectiveState, query, pageIndex: 0 }, "query");
  };

  const handleFilter = (filterId: TFilterId, optionValue: string, checked: boolean) => {
    const selected = effectiveState.filters[filterId] ?? [];
    const nextSelected = checked
      ? [...new Set([...selected, optionValue])]
      : selected.filter((value) => value !== optionValue);
    const nextFilters = { ...effectiveState.filters } as Partial<Record<TFilterId, readonly string[]>>;
    if (nextSelected.length > 0) nextFilters[filterId] = nextSelected;
    else delete nextFilters[filterId];
    updateState({ ...effectiveState, filters: nextFilters, pageIndex: 0 }, "filter");
  };

  const handleClearFilters = () => {
    updateState({
      ...effectiveState,
      query: "",
      filters: {} as DataTableState<TFilterId>["filters"],
      pageIndex: 0,
    }, "clear-filters");
  };

  const isEmpty = status === "ready" && rows.length === 0;
  const hasActiveSearch = Boolean(search && effectiveState.query.trim());
  const hasActiveFilters = Object.keys(effectiveState.filters)
    .some((key) => Boolean(effectiveState.filters[key as TFilterId]?.length));
  const hasActiveCriteria = hasActiveSearch || hasActiveFilters;
  const inferredNoResults = status === "ready" && rows.length > 0 && rowModel.resultRowCount === 0;
  const effectiveStatus = inferredNoResults ? "no-results" : status;
  const showsState = effectiveStatus !== "ready" || isEmpty;
  const resultText = getResultText(
    effectiveState.pageIndex,
    effectiveState.pageSize,
    rowModel.resultRowCount,
    rowModel.totalRowCount,
    itemLabel,
    hasActiveCriteria,
  );
  const resultAnnouncement = getResultAnnouncement(resultText, rowModel.resultRowCount, itemLabel);
  const visibleResultText = addResultNoun(resultText, rowModel.resultRowCount, itemLabel);
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
      {(search || filters.length > 0) && effectiveStatus !== "loading" && effectiveStatus !== "error" && (
        <div className="ledger-data-table__toolbar">
          {search && (
            <div className="ledger-data-table__search">
              <Input
                id={`${instanceId}-search`}
                label={search.label}
                visuallyHiddenLabel
                type="search"
                placeholder={search.placeholder}
                value={effectiveState.query}
                onChange={(event) => handleQuery(event.currentTarget.value)}
              />
            </div>
          )}
          {filters.length > 0 && (
            <div className="ledger-data-table__filters">
              {filters.map((filter, filterIndex) => (
                <FilterControl
                  key={filter.id}
                  definition={filter}
                  filterIndex={filterIndex}
                  instanceId={instanceId}
                  selected={effectiveState.filters[filter.id] ?? []}
                  onChange={handleFilter}
                />
              ))}
              {hasActiveCriteria && (
                <Button type="button" variant="secondary" size="small" onClick={handleClearFilters}>Clear all</Button>
              )}
            </div>
          )}
          {filters.length === 0 && hasActiveCriteria && (
            <Button type="button" variant="secondary" size="small" onClick={handleClearFilters}>Clear all</Button>
          )}
        </div>
      )}
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
        effectiveStatus === "error" ? <StateContent content={errorState} role="alert" />
          : effectiveStatus === "loading" ? <StateContent content={{ title: loadingLabel }} />
          : effectiveStatus === "no-results" ? <div role="status" aria-live="polite" aria-atomic="true"><StateContent content={noResultsState} role="none" /><div className="ledger-data-table__no-results-count">{visibleResultText}</div></div>
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
