import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../../../BankStateProvider";
import { getExpenseTeamModel, getExpenseTeamStaticParams } from "../../expense-data";
import ExpenseTeamPage from "./page";

async function renderTeam(teamId: string) {
  return renderToStaticMarkup(<BankStateProvider>{await ExpenseTeamPage({ params: Promise.resolve({ teamId }) })}</BankStateProvider>);
}

describe("Expense team detail", () => {
  it("generates all five stable team routes", () => {
    const params = getExpenseTeamStaticParams();
    expect(params).toHaveLength(5);
    expect(params).toContainEqual({ teamId: "expense-team-marketing" });
  });

  it("shows the correct Marketing position and cross-team attribution", async () => {
    const model = getExpenseTeamModel("expense-team-marketing")!;
    const sana = model.cardholders.find(({ cardholder }) => cardholder.displayName === "Sana Ali")!;
    expect(sana.primaryTeam.name).toBe("Operations");
    expect(sana.attributedCards).toHaveLength(1);
    expect(sana.settledSpendingMinor).toBeGreaterThan(0);
    const html = await renderTeam("expense-team-marketing");
    expect(html).toContain("<h1>Marketing</h1>");
    expect(html).toContain("£12,810.00");
    expect(html).toContain("£810.00");
    expect(html).toContain("106.75%");
    expect(html).toContain("Sana Ali");
    expect(html).toContain("Primary team: Operations");
    expect(html).toContain('href="/expenses"');
    expect(html).toContain("Recent spending");
    expect(html).toContain("Sana ali virtual");
    expect(html).not.toContain("sana ali virtual");
  });

  it("labels per-transaction limits without cumulative remaining spend", async () => {
    const pages = await Promise.all(getExpenseTeamStaticParams().map(({ teamId }) => renderTeam(teamId)));
    const html = pages.join("");
    expect(html).toContain("per transaction");
    expect(html).toContain("Per purchase");
    expect(html).toContain('aria-label="Per-transaction limit does not have cumulative utilisation"');
  });

  it("shows one company-level status per cardholder in both responsive presentations", async () => {
    const model = getExpenseTeamModel("expense-team-operations")!;
    const html = await renderTeam("expense-team-operations");
    expect(model.cardholders.find(({ cardholder }) => cardholder.displayName === "Daniel Okafor")?.cardholder.status).toBe("frozen");
    expect(model.cardholders.find(({ cardholder }) => cardholder.displayName === "Jack Murphy")?.cardholder.status).toBe("pending_activation");
    expect(html.match(/expense-cardholder-status/g)).toHaveLength(model.cardholders.length * 2);
  });

  it("uses the Next not-found path for an unknown team", async () => {
    await expect(ExpenseTeamPage({ params: Promise.resolve({ teamId: "unknown-team" }) })).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
  });
});
