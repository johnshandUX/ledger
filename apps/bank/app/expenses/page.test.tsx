import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../BankStateProvider";
import ExpensesPage from "./page";
import { getExpensesOverviewModel } from "./expense-data";

describe("Expenses overview", () => {
  it("uses the accepted selectors for organisation and team reporting", () => {
    const model = getExpensesOverviewModel();
    expect(model.teams).toHaveLength(5);
    expect(model.summary.activeCardCount).toBe(29);
    expect(model.summary.attention.missingReceipts).toBe(16);
    expect(model.summary.settledSpendingMinor).not.toBe(model.summary.pendingSpendingMinor);
    expect(model.recentTransactions).toHaveLength(8);
    const marketing = model.teams.find(({ team }) => team.name === "Marketing")!;
    expect(marketing.settledSpendingMinor).toBe(1_281_000);
    expect(marketing.budgetUtilisationPercentage).toBeCloseTo(106.75, 5);
    expect(marketing.remainingBudgetMinor).toBe(-81_000);
  });

  it("renders the information hierarchy, independent attention categories and valid team links", () => {
    const html = renderToStaticMarkup(<BankStateProvider><ExpensesPage /></BankStateProvider>);
    expect(html).toContain("<h1>Expenses</h1>");
    expect(html).toContain('<h2 id="expenses-summary-heading">Summary</h2>');
    expect(html.indexOf("Needs attention")).toBeLessThan(html.indexOf("Team spending"));
    expect(html).toContain("Spent this month");
    expect(html).toContain("Pending spend");
    expect(html).toContain("Missing receipts");
    expect(html).toContain("Pending review");
    expect(html).toContain("Unreconciled");
    expect(html).toMatch(/financial-value[^>]*>16<\/strong><span>Missing receipts<\/span>/);
    expect(html).toContain("106.75%");
    expect(html).toContain("£810.00 over budget");
    expect(html).toContain('href="/expenses/teams/expense-team-marketing"');
    expect(html).toContain('aria-label="Team spending for October 2026"');
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/expenses"|<a[^>]*href="\/expenses"[^>]*aria-current="page"/);
  });
});
