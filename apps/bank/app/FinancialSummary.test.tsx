// @vitest-environment happy-dom

import { act, useEffect, type Dispatch } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FinanceDataset } from "@johnshandux/ledger-synthetic-finance";
import { bankFinanceEnvironment } from "../src/finance/environment";
import type { BankEphemeralAction } from "../src/state/ephemeral-state";
import { getBankAccounts } from "../src/finance/accounts";
import { AccountsDataTable } from "./AccountsDataTable";
import { BankStateProvider, useBankDispatch } from "./BankStateProvider";
import { FinancialSummary } from "./FinancialSummary";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function renderSummary(baseline: FinanceDataset = bankFinanceEnvironment) {
  await act(async () => root.render(
    <BankStateProvider baseline={baseline}><FinancialSummary /></BankStateProvider>,
  ));
}

async function selectCurrency(currency: "GBP" | "USD" | "EUR") {
  const input = container.querySelector<HTMLInputElement>(`input[value="${currency}"]`)!;
  await act(async () => input.click());
}

function summaryText() {
  return container.querySelector(".financial-summary")?.textContent ?? "";
}

function DispatchProbe({ onDispatch }: { onDispatch: (dispatch: Dispatch<BankEphemeralAction>) => void }) {
  const dispatch = useBankDispatch();
  useEffect(() => onDispatch(dispatch), [dispatch, onDispatch]);
  return null;
}

describe("financial summary", () => {
  it("selects GBP initially and derives available, current, and difference from finance data", async () => {
    await renderSummary();

    expect(container.querySelector<HTMLInputElement>('input[value="GBP"]')?.checked).toBe(true);
    expect(summaryText()).toContain("£8,255,319.75");
    expect(summaryText()).toContain("£8,825,121.57");
    expect(summaryText()).toContain("£569,801.82");
  });

  it("updates both visible balances for USD and EUR without a reload", async () => {
    await renderSummary();

    await selectCurrency("USD");
    expect(summaryText()).toContain("US$518,329.65");
    expect(summaryText()).toContain("US$528,235.10");

    await selectCurrency("EUR");
    expect(summaryText()).toContain("€447,307.96");
    expect(summaryText()).toContain("€456,755.11");
  });

  it("uses native grouped-radio and disclosure semantics", async () => {
    await renderSummary();

    const fieldset = container.querySelector("fieldset")!;
    const details = container.querySelector<HTMLDetailsElement>("details")!;
    expect(fieldset.querySelector("legend")?.textContent).toBe("Summary currency");
    expect(fieldset.querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect(details.open).toBe(false);

    await act(async () => container.querySelector<HTMLElement>("summary")!.click());
    expect(details.open).toBe(true);
    await act(async () => container.querySelector<HTMLElement>("summary")!.click());
    expect(details.open).toBe(false);
  });

  it("formats empty currencies as zero and preserves a negative difference", async () => {
    const sourceAccount = bankFinanceEnvironment.accounts.find(account => account.currency === "GBP")!;
    const baseline: FinanceDataset = {
      ...bankFinanceEnvironment,
      accounts: [{ ...sourceAccount, status: "active" }],
      balances: [{
        id: "balance-negative-difference",
        accountId: sourceAccount.id,
        asOf: "2026-10-15T00:00:00Z",
        currency: "GBP",
        ledgerBalanceMinor: -150,
        availableBalanceMinor: 50,
      }],
    };
    await renderSummary(baseline);

    expect(summaryText()).toContain("£0.50");
    expect(summaryText()).toContain("-£1.50");
    expect(summaryText()).toContain("-£2.00");

    await selectCurrency("EUR");
    expect(summaryText()).toContain("€0.00");
  });

  it("does not change the accounts collection when summary currency changes", async () => {
    await act(async () => root.render(
      <BankStateProvider>
        <FinancialSummary />
        <AccountsDataTable accounts={getBankAccounts()} />
      </BankStateProvider>,
    ));
    const availableSort = [...container.querySelectorAll<HTMLButtonElement>(".accounts-table button")]
      .find(button => button.getAttribute("aria-label") === "Sort by Available balance")!;
    await act(async () => availableSort.click());
    const routesBefore = [...container.querySelectorAll<HTMLAnchorElement>(".acc-card")].map(link => link.href);
    const firstAccountBefore = container.querySelector<HTMLElement>(".accounts-table tbody .acc-name")?.textContent;

    await selectCurrency("USD");

    expect([...container.querySelectorAll<HTMLAnchorElement>(".acc-card")].map(link => link.href)).toEqual(routesBefore);
    expect(container.querySelector<HTMLElement>(".accounts-table tbody .acc-name")?.textContent).toBe(firstAccountBefore);
    expect(container.querySelector('.accounts-table th[aria-sort="ascending"]')?.textContent).toContain("Available");
    expect(container.querySelector(".accounts-heading")?.textContent).toContain("30 accounts");
  });

  it("responds to ephemeral balance and account changes without mutating the baseline", async () => {
    let dispatch: Dispatch<BankEphemeralAction> | undefined;
    const baselineBalance = bankFinanceEnvironment.balances.find(
      balance => balance.accountId === "account-main-operating",
    )!;
    const originalAvailable = baselineBalance.availableBalanceMinor;

    await act(async () => root.render(
      <BankStateProvider>
        <DispatchProbe onDispatch={nextDispatch => { dispatch = nextDispatch; }} />
        <FinancialSummary />
        <AccountsDataTable accounts={getBankAccounts()} />
      </BankStateProvider>,
    ));

    await act(async () => dispatch!({
      type: "apply-overlay-deltas",
      deltas: [
        {
          collection: "balances",
          change: {
            kind: "update",
            id: baselineBalance.id,
            changes: { availableBalanceMinor: originalAvailable + 100 },
          },
        },
        {
          collection: "accounts",
          change: { kind: "tombstone", id: "account-general-operations" },
        },
      ],
    }));

    expect(summaryText()).toContain("£8,165,566.73");
    expect(container.querySelector(".accounts-heading")?.textContent).toContain("29 accounts");
    expect(baselineBalance.availableBalanceMinor).toBe(originalAvailable);
  });
});
