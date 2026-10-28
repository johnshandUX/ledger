import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { getBankAccounts } from "../src/finance/accounts";
import { accountColumns, createAccountsPresentationRowModel } from "./AccountsDataTable";
import { BankStateProvider } from "./BankStateProvider";

const renderPage = () => renderToStaticMarkup(<BankStateProvider><Home /></BankStateProvider>);

describe("accounts overview", () => {
  it("uses the page heading as the only visible Accounts title on desktop", () => {
    const html = renderPage();

    expect(html.match(/<h1>Accounts<\/h1>/g)).toHaveLength(1);
    expect(html).not.toContain("<h2>Accounts</h2>");
    expect(html).toContain('class="ledger-workspace-header bank-workspace-header"');
  });

  it("keeps the search input labelled without displaying its label", () => {
    const html = renderPage();

    expect(html).toContain('class="ledger-input-label ledger-input-label--visually-hidden"');
    expect(html).toContain('for="search-accounts"');
    expect(html).toContain('id="search-accounts"');
  });

  it("links the New payment action to the payment journey", () => {
    const html = renderPage();
    expect(html).toContain('href="/payments/new"');
    expect(html).toContain("New payment");
    expect(html).not.toContain("Overview of company accounts and balances.");
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
    expect(html).toContain(">Sort code<");
    expect(html).toContain(">Account number<");
    expect(html).not.toContain("Number / Sort");
    expect(html).toContain("Sort accounts by");
    expect(html).toContain('class="accounts-table"');
    expect(html).toContain("accounts");
    expect(accountColumns.map(({ id }) => id)).toEqual([
      "account",
      "sortCode",
      "accountNumber",
      "type",
      "currentBalance",
      "availableBalance",
    ]);
  });

  it("keeps account status in the data without displaying it in the desktop table", () => {
    const accounts = getBankAccounts();
    const accountColumn = accountColumns.find(({ id }) => id === "account")!;
    const activeAccount = accounts.find(({ status, name }) => status === "active" && !name.toLowerCase().includes(status))!;
    const accountCell = renderToStaticMarkup(<>{accountColumn.cell({ row: activeAccount, rowId: activeAccount.id })}</>);

    expect(activeAccount.status).toBe("active");
    expect(accountCell).toContain(activeAccount.name);
    expect(accountCell).not.toContain(">active<");
  });

  it("renders separate UK identifiers without losing formatting or leading zeroes", () => {
    const account = {
      ...getBankAccounts()[0]!,
      sortCode: "01-02-03",
      accountNumber: "00123456",
    };
    const sortCode = accountColumns.find(({ id }) => id === "sortCode")!;
    const accountNumber = accountColumns.find(({ id }) => id === "accountNumber")!;
    const sortCodeHtml = renderToStaticMarkup(<>{sortCode.cell({ row: account, rowId: account.id })}</>);
    const accountNumberHtml = renderToStaticMarkup(<>{accountNumber.cell({ row: account, rowId: account.id })}</>);

    expect(sortCodeHtml).toContain('class="account-identifier">01-02-03<');
    expect(accountNumberHtml).toContain('class="account-identifier">00123456<');
    expect(sortCode.sort).toBeUndefined();
    expect(accountNumber.sort).toBeUndefined();
  });

  it("keeps desktop account identifiers in Ledger product typography", () => {
    const css = readFileSync(new URL("./accounts.css", import.meta.url), "utf8");

    expect(css).toMatch(
      /\.account-identifier\s*\{[^}]*font-family:var\(--ledger-font-family-product\)/,
    );
    expect(css).not.toMatch(/\.account-identifier\s*\{[^}]*brand-mono/);
  });

  it("keeps clear space below the summary values", () => {
    const css = readFileSync(new URL("./accounts.css", import.meta.url), "utf8");

    expect(css).toMatch(
      /\.financial-summary-card__body\.ledger-card__body\{[^}]*padding:var\(--ledger-space-2\) var\(--ledger-space-4\) var\(--ledger-space-6\)/,
    );
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
