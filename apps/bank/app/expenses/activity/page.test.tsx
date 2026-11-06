import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BankStateProvider } from "../../BankStateProvider";
import AllExpensesActivityPage from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("All expenses activity scaffold", () => {
  it("explains the planned organisation-wide activity and export view", () => {
    const html = renderToStaticMarkup(<BankStateProvider><AllExpensesActivityPage /></BankStateProvider>);
    expect(html).toContain("<h1>All expenses activity</h1>");
    expect(html).toContain("activity across every team");
    expect(html).toContain("export it from one place");
    expect(html).toContain('href="/expenses">Expenses</a>');
  });
});
