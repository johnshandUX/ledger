import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "../BankStateProvider";
import PaymentsPage from "./page";

describe("payments overview", () => {
  it("renders shared summary values without implying additive categories", () => {
    const html = renderToStaticMarkup(<BankStateProvider><PaymentsPage /></BankStateProvider>);
    expect(html).toContain("Payments in progress");
    expect(html).toContain(">8<");
    expect(html).toContain("5 scheduled · 3 processing");
    expect(html).not.toContain("4 awaiting approval ·");
    expect(html).toContain("Outstanding approvals");
    expect(html).toContain(">7<");
    expect(html).toContain("Across 4 payments");
    expect(html).toContain("Payment activity");
    expect(html).toContain('href="/payments/new"');
    expect(html).toContain("payments");
  });
});
