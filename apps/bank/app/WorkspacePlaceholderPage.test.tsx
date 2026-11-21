import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BankStateProvider } from "./BankStateProvider";
import CashflowPage from "./cashflow/page";
import TaxPage from "./tax/page";
import TreasuryPage from "./treasury/page";

const workspaces = [
  ["Cashflow", "Understand your cash position, anticipate what’s coming and plan ahead.", "/cashflow", CashflowPage],
  ["Tax", "Keep track of tax commitments and important dates.", "/tax", TaxPage],
  ["Treasury", "Manage liquidity, funding and financial risk across your organisation.", "/treasury", TreasuryPage],
] as const;

describe("Operations workspace placeholders", () => {
  it.each(workspaces)("renders the restrained %s placeholder with active navigation", (title, description, href, Page) => {
    const html = renderToStaticMarkup(<BankStateProvider><Page /></BankStateProvider>);

    expect(html).toContain(`<h1>${title}</h1>`);
    expect(html).toContain(description);
    expect(html).toContain("Functionality for this workspace has not yet been developed.");
    expect(html).toMatch(new RegExp(`<a[^>]*(?:aria-current="page"[^>]*href="${href}"|href="${href}"[^>]*aria-current="page")`));
    expect(html).not.toContain("dashboard");
  });
});
