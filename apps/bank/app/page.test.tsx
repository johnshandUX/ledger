import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { getBankAccounts } from "../src/finance/accounts";
import { accountColumns, createAccountsPresentationRowModel } from "./AccountsDataTable";
import { BankStateProvider } from "./BankStateProvider";

const renderPage = () => renderToStaticMarkup(<BankStateProvider><Home /></BankStateProvider>);

describe("accounts overview", () => {
  it("keeps the search input labelled without displaying its label", () => {
    const html = renderPage();

    expect(html).toContain('class="ledger-input-label ledger-input-label--visually-hidden"');
    expect(html).toContain('for="search-accounts"');
    expect(html).toContain('id="search-accounts"');
  });

  it("links the Make a payment action to the payment journey", () => {
    const html = renderPage();
    expect(html).toContain('href="/payments/new"');
    expect(html).toContain("Make a payment");
  });

  it("makes each mobile account card one semantic navigation target", () => {
    const html = renderPage();

    expect(html).toContain('class="acc-card" href="/accounts/account-main-operating"');
    expect(html).toContain("Main Operating Account");
    expect(html).not.toContain('<article class="acc-card"');
  });

  it("uses the interactive DataTable for the desktop accounts presentation", () => {
    const html = renderPage();

    expect(html).toContain("Accounts and balances");
    expect(html).toContain("Sort by Account");
    expect(html).toContain("Sort by Available balance");
    expect(html).toContain("Sort accounts by");
    expect(html).toContain('class="accounts-table"');
    expect(html).toContain("accounts");
    expect(accountColumns.map(({ id }) => id)).toEqual([
      "account",
      "accountNumber",
      "type",
      "currentBalance",
      "availableBalance",
    ]);
  });

  it("uses the requested mobile card hierarchy and status treatment", () => {
    const html = renderPage();
    const mobile = html.slice(html.indexOf('class="accounts-mobile"'));
    const firstCard = mobile.slice(mobile.indexOf('<article class="acc-card-shell">'), mobile.indexOf('</article>') + '</article>'.length);
    const restrictedCardStart = mobile.indexOf('href="/accounts/account-restricted-project"');
    const restrictedCard = mobile.slice(restrictedCardStart, mobile.indexOf('</article>', restrictedCardStart));
    const closedCardStart = mobile.indexOf('href="/accounts/account-historical-plant"');
    const closedCard = mobile.slice(closedCardStart, mobile.indexOf('</article>', closedCardStart));

    expect(mobile).toContain("10-00-01");
    expect(mobile).toContain("90000001");
    expect(mobile).toContain("£179,802.15");
    expect(mobile).toContain("Available balance");
    expect(firstCard).not.toContain("ledger-badge");
    expect(restrictedCard).toContain(">Restricted<");
    expect(closedCard).toContain(">Closed<");
    expect(firstCard).not.toContain("Current:");
    expect(firstCard).not.toContain("Current account");
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
