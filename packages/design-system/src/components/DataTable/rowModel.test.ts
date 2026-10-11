import { describe, expect, it } from "vitest";
import type { DataTableColumn, DataTableFilterDefinition, DataTableState } from "./DataTable.types";
import { createDataTableRowModel } from "./rowModel";

type Row = { id: string; name: string; amount: number };

const rows: readonly Row[] = [
  { id: "a", name: "Beta", amount: 20 },
  { id: "b", name: "Alpha", amount: 10 },
  { id: "c", name: "Alpha", amount: 30 },
  { id: "d", name: "Delta", amount: 40 },
];

const columns: readonly DataTableColumn<Row>[] = [
  { id: "name", label: "Name", header: "Name", cell: ({ row }) => row.name, sort: { value: row => row.name } },
  { id: "amount", label: "Amount", header: "Amount", cell: ({ row }) => row.amount, sort: { value: row => row.amount } },
];

type FilterId = "amount" | "initial";
const filters: readonly DataTableFilterDefinition<Row, FilterId>[] = [
  {
    id: "amount",
    label: "Amount",
    options: [
      { value: "low", label: "Low" },
      { value: "high", label: "High" },
      { value: "missing", label: "Missing" },
    ],
    values: row => row.amount < 30 ? "low" : "high",
  },
  {
    id: "initial",
    label: "Initial",
    options: [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
      { value: "unassigned", label: "Unassigned" },
    ],
    values: row => row.name === "Delta" ? ["unassigned"] : [row.name[0]!.toLowerCase()],
  },
];

const search = { label: "Search rows", values: (row: Row) => [row.name, row.id] };

function state(overrides: Partial<DataTableState> = {}): DataTableState {
  return { query: "", filters: {}, pageIndex: 0, pageSize: 10, ...overrides };
}

describe("createDataTableRowModel", () => {
  it("sorts ascending stably", () => {
    const model = createDataTableRowModel({ rows, columns, state: state({ sort: { columnId: "name", direction: "ascending" } }) });
    expect(model.sortedRows.map(row => row.id)).toEqual(["b", "c", "a", "d"]);
  });

  it("normalizes search text and matches any searchable value", () => {
    const unicodeRows = [{ id: "fullwidth", name: "Ａｌｐｈａ   Team", amount: 1 }, ...rows];
    const byName = createDataTableRowModel({
      rows: unicodeRows,
      columns,
      search,
      state: state({ query: "  alpha team  " }),
    });
    const byId = createDataTableRowModel({ rows, columns, search, state: state({ query: " C " }) });
    expect(byName.filteredRows.map(row => row.id)).toEqual(["fullwidth"]);
    expect(byId.filteredRows.map(row => row.id)).toEqual(["c"]);
    expect(createDataTableRowModel({ rows, columns, search, state: state({ query: "   " }) }).filteredRows).toEqual(rows);
  });

  it("ignores nullish and empty searchable values", () => {
    const missingSearch = { label: "Search", values: (row: Row) => [null, undefined, "", row.name] };
    expect(createDataTableRowModel({ rows, columns, search: missingSearch, state: state({ query: "beta" }) }).filteredRows.map(row => row.id)).toEqual(["a"]);
  });

  it("uses OR within a filter and AND between filters", () => {
    const orModel = createDataTableRowModel<Row, FilterId>({
      rows, columns, filters, state: state({ filters: { initial: ["a", "b"] } }),
    });
    const andModel = createDataTableRowModel<Row, FilterId>({
      rows, columns, filters, state: state({ filters: { initial: ["a", "b"], amount: ["low"] } }),
    });
    expect(orModel.filteredRows.map(row => row.id)).toEqual(["a", "b", "c"]);
    expect(andModel.filteredRows.map(row => row.id)).toEqual(["a", "b"]);
  });

  it("combines search and filters with AND semantics", () => {
    const model = createDataTableRowModel<Row, FilterId>({
      rows, columns, search, filters,
      state: state({ query: "alpha", filters: { amount: ["high"] } }),
    });
    expect(model.filteredRows.map(row => row.id)).toEqual(["c"]);
  });

  it("supports multiple row values and consumer-defined absence values", () => {
    const multiValueFilters: readonly DataTableFilterDefinition<Row, "classification">[] = [{
      id: "classification",
      label: "Classification",
      options: [{ value: "alpha", label: "Alpha" }, { value: "unassigned", label: "Unassigned" }],
      values: row => row.name === "Delta" ? ["unassigned"] : [row.name.toLowerCase(), row.name[0]!.toLowerCase()],
    }];
    const alpha = createDataTableRowModel({ rows, columns, filters: multiValueFilters, state: state({ filters: { classification: ["alpha"] } }) });
    const unassigned = createDataTableRowModel({ rows, columns, filters: multiValueFilters, state: state({ filters: { classification: ["unassigned"] } }) });
    expect(alpha.filteredRows.map(row => row.id)).toEqual(["b", "c"]);
    expect(unassigned.filteredRows.map(row => row.id)).toEqual(["d"]);
  });

  it("normalizes unknown and duplicate filter selections without mutating input state", () => {
    const input = state({ filters: { amount: ["low", "low", "unknown"], unknown: ["value"] } });
    const snapshot = structuredClone(input);
    const model = createDataTableRowModel({ rows, columns, filters, state: input });
    expect(model.state.filters).toEqual({ amount: ["low"] });
    expect(input).toEqual(snapshot);
  });

  it("treats empty selections as inactive and nullish row values as unmatched", () => {
    const nullableFilter: readonly DataTableFilterDefinition<Row, "optional">[] = [{
      id: "optional", label: "Optional", options: [{ value: "present", label: "Present" }],
      values: row => row.id === "a" ? "present" : null,
    }];
    expect(createDataTableRowModel({ rows, columns, filters: nullableFilter, state: state({ filters: { optional: [] } }) }).filteredRows).toEqual(rows);
    expect(createDataTableRowModel({ rows, columns, filters: nullableFilter, state: state({ filters: { optional: ["present"] } }) }).filteredRows.map(row => row.id)).toEqual(["a"]);
  });

  it("sorts descending and keeps equal values in source order", () => {
    const model = createDataTableRowModel({ rows, columns, state: state({ sort: { columnId: "name", direction: "descending" } }) });
    expect(model.sortedRows.map(row => row.id)).toEqual(["d", "a", "b", "c"]);
  });

  it("uses a custom comparator", () => {
    const customColumns: readonly DataTableColumn<Row>[] = [{
      ...columns[0],
      sort: { value: row => row.name, compare: (left, right) => left.amount - right.amount },
    }];
    const model = createDataTableRowModel({ rows, columns: customColumns, state: state({ sort: { columnId: "name", direction: "ascending" } }) });
    expect(model.sortedRows.map(row => row.amount)).toEqual([10, 20, 30, 40]);
  });

  it("lets a custom comparator own nullish ordering", () => {
    const customRows = [{ id: "missing", rank: null }, { id: "present", rank: 1 }];
    const customColumns: readonly DataTableColumn<(typeof customRows)[number]>[] = [{
      id: "rank",
      label: "Rank",
      header: "Rank",
      cell: ({ row }) => row.rank,
      sort: {
        value: row => row.rank,
        compare: (left, right) => left.rank == null ? -1 : right.rank == null ? 1 : left.rank - right.rank,
      },
    }];
    const model = createDataTableRowModel({ rows: customRows, columns: customColumns, state: state({ sort: { columnId: "rank", direction: "ascending" } }) });
    expect(model.sortedRows.map(row => row.id)).toEqual(["missing", "present"]);
  });

  it("paginates and clamps an out-of-range page", () => {
    const model = createDataTableRowModel({ rows, columns, state: state({ pageIndex: 9, pageSize: 2 }) });
    expect(model.pageCount).toBe(2);
    expect(model.visibleRows.map(row => row.id)).toEqual(["c", "d"]);
  });

  it("filters before stable sorting and pagination and reports authoritative counts", () => {
    const model = createDataTableRowModel<Row, FilterId>({
      rows, columns, filters, pageSizeOptions: [1, 2, 4],
      state: state({ filters: { initial: ["a"] }, sort: { columnId: "amount", direction: "descending" }, pageSize: 1, pageIndex: 1 }),
    });
    expect(model.filteredRows.map(row => row.id)).toEqual(["b", "c"]);
    expect(model.sortedRows.map(row => row.id)).toEqual(["c", "b"]);
    expect(model.visibleRows.map(row => row.id)).toEqual(["b"]);
    expect(model).toMatchObject({ totalRowCount: 4, resultRowCount: 2, pageCount: 2 });
  });

  it("returns no pages for an empty dataset", () => {
    const model = createDataTableRowModel({ rows: [], columns, state: state() });
    expect(model).toMatchObject({ totalRowCount: 0, resultRowCount: 0, pageCount: 0, filteredRows: [], visibleRows: [] });
  });

  it("keeps nullish values last in both directions", () => {
    const nullableRows = [{ id: "missing", value: null }, { id: "present", value: 2 }];
    const nullableColumns: readonly DataTableColumn<(typeof nullableRows)[number]>[] = [{
      id: "value", label: "Value", header: "Value", cell: ({ row }) => row.value, sort: { value: row => row.value },
    }];
    const ascending = createDataTableRowModel({ rows: nullableRows, columns: nullableColumns, state: state({ sort: { columnId: "value", direction: "ascending" } }) });
    const descending = createDataTableRowModel({ rows: nullableRows, columns: nullableColumns, state: state({ sort: { columnId: "value", direction: "descending" } }) });
    expect(ascending.sortedRows.map(row => row.id)).toEqual(["present", "missing"]);
    expect(descending.sortedRows.map(row => row.id)).toEqual(["present", "missing"]);
  });

  it("sorts dates and booleans by their raw values", () => {
    const typedRows = [
      { id: "later", date: new Date("2026-02-01"), active: true },
      { id: "earlier", date: new Date("2026-01-01"), active: false },
    ];
    const dateColumn: readonly DataTableColumn<(typeof typedRows)[number]>[] = [{ id: "date", label: "Date", header: "Date", cell: ({ row }) => row.id, sort: { value: row => row.date } }];
    const booleanColumn: readonly DataTableColumn<(typeof typedRows)[number]>[] = [{ id: "active", label: "Active", header: "Active", cell: ({ row }) => row.id, sort: { value: row => row.active } }];
    expect(createDataTableRowModel({ rows: typedRows, columns: dateColumn, state: state({ sort: { columnId: "date", direction: "ascending" } }) }).sortedRows[0].id).toBe("earlier");
    expect(createDataTableRowModel({ rows: typedRows, columns: booleanColumn, state: state({ sort: { columnId: "active", direction: "ascending" } }) }).sortedRows[0].id).toBe("earlier");
  });

  it("normalizes invalid pagination and unknown sort state", () => {
    const model = createDataTableRowModel({
      rows,
      columns,
      pageSizeOptions: [10, 20, 50],
      state: state({ pageIndex: -4, pageSize: 0, sort: { columnId: "missing", direction: "ascending" } }),
    });
    expect(model.state).toMatchObject({ pageIndex: 0, pageSize: 10, sort: undefined });
  });

  it("does not mutate source rows", () => {
    const source = [...rows];
    createDataTableRowModel({ rows: source, columns, state: state({ sort: { columnId: "amount", direction: "descending" } }) });
    expect(source).toEqual(rows);
  });
});
