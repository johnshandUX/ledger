// @vitest-environment happy-dom

import { useState } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";
import type { DataTableColumn, DataTableState } from "./DataTable.types";

type Row = { id: string; name: string };
const rows = Array.from({ length: 25 }, (_, index) => ({ id: `row-${index + 1}`, name: `Row ${index + 1}` }));
const columns: readonly DataTableColumn<Row>[] = [{ id: "name", label: "Name", header: "Name", cell: ({ row }) => row.name }];

function Harness() {
  const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: 10 });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(["row-1", "row-15"]));
  return <><button type="button" onClick={() => setState(current => ({ ...current, pageIndex: 0, pageSize: 20 }))}>Show 20 rows</button><output>{[...selected].join(",")}</output><DataTable caption="Rows" rows={rows} columns={columns} getRowId={row => row.id} pageSizeOptions={[10, 20, 50]} state={state} onStateChange={setState} selection={{ selectedRowIds: selected, onSelectedRowIdsChange: setSelected, getRowSelectionLabel: row => `Select ${row.name}` }} /></>;
}

describe("DataTable selection interactions", () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => { container = document.createElement("div"); document.body.append(container); root = createRoot(container); flushSync(() => root.render(<Harness />)); });
  afterEach(() => { flushSync(() => root.unmount()); container.remove(); });

  it("preserves stable selected IDs when page size changes", async () => {
    expect(container.querySelector("output")?.textContent).toBe("row-1,row-15");
    flushSync(() => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Show 20 rows")!.click());
    expect(container.querySelector("output")?.textContent).toBe("row-1,row-15");
    const rowFifteen = [...container.querySelectorAll<HTMLLabelElement>(".ledger-checkbox-label")].find(label => label.textContent === "Select Row 15")!;
    expect(rowFifteen.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(true);
  });
});
