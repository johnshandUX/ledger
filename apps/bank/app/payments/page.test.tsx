import { readFileSync } from "node:fs";
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

  it("uses the Accounts mobile metric typography and compact responsive layout", () => {
    const html = renderToStaticMarkup(<BankStateProvider><PaymentsPage /></BankStateProvider>);
    const css = readFileSync(new URL("./payments.css", import.meta.url), "utf8");

    expect(html.match(/class="payment-summary-value financial-value"/g)).toHaveLength(4);
    expect(css).toMatch(/@media\(max-width:760px\)/);
    expect(css).toMatch(/\.payment-summary-primary,\.payment-summary-approvals\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;align-items:center/);
    expect(css).toMatch(/\.payment-summary-primary>strong,\.payment-summary-approvals>strong,\.payment-summary-secondary strong\{[^}]*font-size:var\(--ledger-font-size-heading-small\);line-height:var\(--ledger-line-height-body\);font-weight:var\(--ledger-font-weight-semibold\)/);
    expect(css).toMatch(/\.payment-summary-secondary>div\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;align-items:center/);
    expect(css).toMatch(/\.payment-summary-secondary>div\+div\{[^}]*border-top:var\(--ledger-border-width-thin\) solid var\(--ledger-color-border\)/);
  });
});
