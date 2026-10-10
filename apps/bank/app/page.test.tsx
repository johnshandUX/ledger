import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { getBankAccounts } from "../src/finance/accounts";
import { createAccountsPresentationRowModel } from "./AccountsDataTable";

describe("accounts overview", () => {
  it("keeps the search input labelled without displaying its label", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('class="ledger-input-label ledger-input-label--visually-hidden"');
    expect(html).toContain('for="search-accounts"');
    expect(html).toContain('id="search-accounts"');
  });

  it("links the Make a payment action to the payment journey", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain('href="/payments/new"');
    expect(html).toContain("Make a payment");
  });

  it("keeps passive mobile account articles out of the tab order", () => {
    const html = renderToStaticMarkup(<Home />);
    const accountArticles = html.match(/<article\b[^>]*class="[^"]*\bacc-card\b[^"]*"[^>]*>/g);

    expect(accountArticles).not.toBeNull();
    expect(accountArticles?.every((article) => !article.includes("tabindex="))).toBe(true);
  });

  it("uses the interactive DataTable for the desktop accounts presentation", () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain("Accounts and balances");
    expect(html).toContain("Sort by Account");
    expect(html).toContain("Sort by Available balance");
    expect(html).toContain("Sort accounts by");
    expect(html).toContain('class="accounts-table"');
    expect(html).toContain("accounts");
  });

  it("derives the responsive account order from the shared controlled row model", () => {
    const accounts = getBankAccounts();
    const rowModel = createAccountsPresentationRowModel(accounts, {
      query: "",
      filters: {},
      pageIndex: 0,
      pageSize: 20,
      sort: { columnId: "availableBalance", direction: "ascending" },
    });

    expect(rowModel.visibleRows).toHaveLength(20);
    expect(rowModel.sortedRows).toHaveLength(30);
    expect(rowModel.sortedRows[0]?.availableBalanceMinor).toBeLessThanOrEqual(
      rowModel.sortedRows[1]!.availableBalanceMinor,
    );
  });

  it("keeps the full sorted account dataset available beyond the desktop page size", () => {
    const fixtures = getBankAccounts();
    const accounts = Array.from({ length: 21 }, (_, index) => ({
      ...fixtures[index % fixtures.length],
      id: `account-${index}`,
      availableBalanceMinor: 21 - index,
    }));
    const rowModel = createAccountsPresentationRowModel(accounts, {
      query: "",
      filters: {},
      pageIndex: 0,
      pageSize: 20,
      sort: { columnId: "availableBalance", direction: "ascending" },
    });

    expect(rowModel.visibleRows).toHaveLength(20);
    expect(rowModel.sortedRows).toHaveLength(21);
    expect(rowModel.sortedRows[0]?.availableBalanceMinor).toBe(1);
  });
});
