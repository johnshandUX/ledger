import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableFilterDefinition } from "./DataTable.types";

type Row = { id: string; name: string };
const columns: readonly DataTableColumn<Row>[] = [
  { id: "name", label: "Name", header: "Name", cell: ({ row }) => row.name, sort: { value: row => row.name } },
];
const filters: readonly DataTableFilterDefinition<Row, "name">[] = [{
  id: "name",
  label: "Name",
  options: [{ value: "ada", label: "Ada" }, { value: "grace", label: "Grace" }],
  values: row => row.name.toLowerCase(),
}];

describe("DataTable", () => {
  it("composes a semantic table with a caption and sortable header", () => {
    const html = renderToStaticMarkup(<DataTable caption="People" rows={[{ id: "1", name: "Ada" }]} columns={columns} getRowId={row => row.id} />);
    expect(html).toContain("<table");
    expect(html).toContain("<caption");
    expect(html).toContain("People");
    expect(html).toContain('aria-sort="none"');
    expect(html).toContain('type="button"');
  });

  it("renders loading before empty state", () => {
    const html = renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} status="loading" loadingLabel="Loading people" />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading people");
    expect(html).not.toContain("No data to display");
  });

  it("renders empty and error foundations distinctly", () => {
    const empty = renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} emptyState={{ title: "No people" }} />);
    const error = renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} status="error" errorState={{ title: "People unavailable" }} />);
    expect(empty).toContain("No people");
    expect(error).toContain("People unavailable");
  });

  it("exposes density and row treatment independently", () => {
    const html = renderToStaticMarkup(<DataTable caption="People" rows={[{ id: "1", name: "Ada" }]} columns={columns} getRowId={row => row.id} density="compact" rowTreatment="zebra" />);
    expect(html).toContain('data-density="compact"');
    expect(html).toContain('data-row-treatment="zebra"');
  });

  it("keeps non-sortable headers passive and reports a paginated range", () => {
    const passiveColumns: readonly DataTableColumn<Row>[] = [{ id: "name", label: "Name", header: "Name", cell: ({ row }) => row.name }];
    const rows = Array.from({ length: 12 }, (_, index) => ({ id: String(index), name: `Person ${index}` }));
    const html = renderToStaticMarkup(<DataTable caption="People" rows={rows} columns={passiveColumns} getRowId={row => row.id} />);
    expect(html).not.toContain("Sort by Name");
    expect(html).toContain("1–10 of 12");
    expect(html).toContain('aria-label="Page 1"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Next page"');
    expect(html).not.toContain('aria-label="Previous page"');
  });

  it("uses an optional item label to give visible and announced counts domain context", () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({ id: String(index), name: `Account ${index}` }));
    const html = renderToStaticMarkup(
      <DataTable caption="Accounts" rows={rows} columns={columns} getRowId={row => row.id} itemLabel={{ singular: "account", plural: "accounts" }} />,
    );
    expect(html).toContain("1–10 of 12 accounts");
    expect(html).toContain("Showing 1–10 of 12 accounts");
  });

  it("uses Ledger sort and direction icons", () => {
    const unsorted = renderToStaticMarkup(<DataTable caption="People" rows={[{ id: "1", name: "Ada" }]} columns={columns} getRowId={row => row.id} />);
    const sorted = renderToStaticMarkup(<DataTable caption="People" rows={[{ id: "1", name: "Ada" }]} columns={columns} getRowId={row => row.id} defaultState={{ sort: { columnId: "name", direction: "ascending" } }} />);
    expect(unsorted).toContain("lucide-arrow-up-down");
    expect(sorted).toContain("lucide-arrow-up");
  });

  it("shows pagination chevrons only when they lead to another page", () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({ id: String(index), name: `Person ${index}` }));
    const html = renderToStaticMarkup(
      <DataTable caption="People" rows={rows} columns={columns} getRowId={row => row.id} defaultState={{ pageIndex: 1 }} />,
    );
    expect(html).toContain('aria-label="Previous page"');
    expect(html).not.toContain('aria-label="Next page"');
  });

  it("renders no-results outside table row semantics", () => {
    const html = renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} status="no-results" noResultsState={{ title: "No matching people" }} />);
    expect(html).toContain("No matching people");
    expect(html).toContain('role="status"');
    expect(html).not.toContain("<td");
  });

  it("renders an accessible configured toolbar for ready and empty datasets", () => {
    const ready = renderToStaticMarkup(
      <DataTable caption="People" rows={[{ id: "1", name: "Ada" }]} columns={columns} getRowId={row => row.id} search={{ label: "Search people", placeholder: "Name or email", values: row => [row.name] }} filters={filters} />,
    );
    const empty = renderToStaticMarkup(
      <DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} search={{ label: "Search people", values: row => [row.name] }} filters={filters} />,
    );
    for (const html of [ready, empty]) {
      expect(html).toContain('type="search"');
      expect(html).toContain("Search people");
      expect(html).toContain("Name");
    }
    expect(empty).toContain("No data to display");
  });

  it("infers no-results and presents matching and total counts", () => {
    const html = renderToStaticMarkup(
      <DataTable
        caption="People"
        rows={[{ id: "1", name: "Ada" }, { id: "2", name: "Grace" }]}
        columns={columns}
        getRowId={row => row.id}
        search={{ label: "Search people", values: row => [row.name] }}
        itemLabel={{ singular: "person", plural: "people" }}
        defaultState={{ query: "missing" }}
      />,
    );
    expect(html).toContain("No matching results");
    expect(html).toContain("0 matching people from 2 total");
    expect(html).toContain("Clear all");
    expect(html).not.toContain("<td");
  });

  it("preserves explicit loading and error precedence over derived results", () => {
    const props = {
      caption: "People",
      rows: [{ id: "1", name: "Ada" }],
      columns,
      getRowId: (row: Row) => row.id,
      search: { label: "Search people", values: (row: Row) => [row.name] },
      defaultState: { query: "missing" },
    } as const;
    const loading = renderToStaticMarkup(<DataTable {...props} status="loading" loadingLabel="Loading people" />);
    const error = renderToStaticMarkup(<DataTable {...props} status="error" errorState={{ title: "People unavailable" }} />);
    expect(loading).toContain("Loading people");
    expect(loading).not.toContain("No matching results");
    expect(error).toContain("People unavailable");
    expect(error).not.toContain("No matching results");
  });

  it("uses unique field identities for multiple tables", () => {
    const html = renderToStaticMarkup(<><DataTable caption="First people" rows={[]} columns={columns} getRowId={row => row.id} search={{ label: "Search people", values: row => [row.name] }} /><DataTable caption="Second people" rows={[]} columns={columns} getRowId={row => row.id} search={{ label: "Search people", values: row => [row.name] }} /></>);
    const ids = [...html.matchAll(/id="([^"]+-search)"/g)].map(([, id]) => id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("gives errors alert semantics", () => {
    const html = renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} status="error" errorState={{ title: "People unavailable" }} />);
    expect(html).toContain('role="alert"');
  });

  it("rejects duplicate column and row identities", () => {
    expect(() => renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={[...columns, ...columns]} getRowId={row => row.id} />)).toThrow(/column IDs/);
    expect(() => renderToStaticMarkup(<DataTable caption="People" rows={[{ id: "1", name: "Ada" }, { id: "1", name: "Grace" }]} columns={columns} getRowId={row => row.id} />)).toThrow(/row IDs/);
  });

  it("rejects invalid page-size options", () => {
    expect(() => renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} pageSizeOptions={[20, 10]} />)).toThrow(/ascending/);
  });

  it("rejects duplicate filter identities and option values", () => {
    expect(() => renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} filters={[...filters, ...filters]} />)).toThrow(/filter IDs/);
    expect(() => renderToStaticMarkup(<DataTable caption="People" rows={[]} columns={columns} getRowId={row => row.id} filters={[{ ...filters[0]!, options: [...filters[0]!.options, filters[0]!.options[0]!] }]} />)).toThrow(/option values/);
  });
});
