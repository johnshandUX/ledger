import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table";

describe("Table", () => {
  it("composes native table structure with an accessible name", () => {
    const html = renderToStaticMarkup(<Table ariaLabel="Accounts"><TableHead><TableRow><TableHeaderCell>Account</TableHeaderCell></TableRow></TableHead><TableBody><TableRow><TableCell>Operating</TableCell></TableRow></TableBody></Table>);
    expect(html).toContain('<table class="ledger-table" aria-label="Accounts">');
    expect(html).toContain('<thead');
    expect(html).toContain('<tbody');
    expect(html).toContain('<th class="ledger-table__cell ledger-table__header" scope="col"');
    expect(html).toContain('<td class="ledger-table__cell"');
  });

  it("uses column scope by default while preserving explicit scope and alignment styles", () => {
    const html = renderToStaticMarkup(<Table><TableHead><TableRow><TableHeaderCell scope="row" align="right" style={{ width: 120 }}>Balance</TableHeaderCell></TableRow></TableHead></Table>);
    expect(html).toContain('scope="row"');
    expect(html).toMatch(/style="[^"]*text-align:right/);
    expect(html).toMatch(/style="[^"]*width:120px/);
  });
});
