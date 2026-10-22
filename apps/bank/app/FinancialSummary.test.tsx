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

function summaryText() {
  return container.querySelector(".financial-summary")?.textContent ?? "";
}

async function openBalanceMenu() {
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Choose balance view"]')!;
  await act(async () => {
    trigger.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: true,
      button: 0,
      pointerType: "mouse",
    }));
  });
}

function DispatchProbe({ onDispatch }: { onDispatch: (dispatch: Dispatch<BankEphemeralAction>) => void }) {
  const dispatch = useBankDispatch();
  useEffect(() => onDispatch(dispatch), [dispatch, onDispatch]);
  return null;
}

describe("financial summary", () => {
  it("renders one consolidated card with currencies in stable GBP, USD, EUR order", async () => {
    await renderSummary();

    expect(container.querySelectorAll(".financial-summary-card")).toHaveLength(1);
    const currencies = [...container.querySelectorAll<HTMLElement>(".financial-summary-card__currency")];
    expect(currencies).toHaveLength(3);
    expect(currencies.map(section => section.querySelector(".financial-summary-card__identity")?.textContent)).toEqual([
      "£GBP",
      "$USD",
      "€EUR",
    ]);
    for (const section of currencies) {
      expect(section.querySelectorAll(".financial-summary-card__value")).toHaveLength(1);
    }
    expect(container.querySelectorAll(".financial-summary-card__mobile-separator")).toHaveLength(2);
    expect(container.querySelector(".ledger-separator--vertical")).toBeNull();
  });

  it("shows available balances by default without symbols in the numeric values", async () => {
    await renderSummary();

    expect(container.querySelector('.financial-summary-card__view-label')?.textContent).toBe("Available balance");
    expect(summaryText()).toContain("8,255,319.75");
    expect(summaryText()).toContain("518,329.65");
    expect(summaryText()).toContain("447,307.96");
    const values = [...container.querySelectorAll(".financial-summary-card__value")].map(value => value.textContent);
    expect(values).toEqual(["8,255,319.75", "518,329.65", "447,307.96"]);
    expect(values.join("")).not.toMatch(/[£$€]|(?:GBP|USD|EUR)/);
  });

  it("opens the global balance menu with supported and disabled views", async () => {
    await renderSummary();
    await openBalanceMenu();

    const options = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
    expect(options.map(option => option.textContent?.replace("✓", ""))).toEqual([
      "Available balance",
      "Total balance",
      "Including pending",
      "Excluding pending",
    ]);
    expect(options[0]?.getAttribute("aria-checked")).toBe("true");
    expect(options[1]?.getAttribute("aria-checked")).toBe("false");
    expect(options[2]?.getAttribute("aria-disabled")).toBe("true");
    expect(options[3]?.getAttribute("aria-disabled")).toBe("true");
    expect(options[2]?.getAttribute("aria-describedby")).toBe("pending-balance-view-description");
    expect(document.body.textContent).toContain("Pending movement data is unavailable.");

    await act(async () => options[2]?.click());
    expect(container.querySelector('.financial-summary-card__view-label')?.textContent).toBe("Available balance");
    expect(container.querySelector('input[name="summary-currency"]')).toBeNull();
    expect(container.querySelector("details")).toBeNull();
  });

  it("selects total balance once for all three currencies", async () => {
    await renderSummary();
    await openBalanceMenu();

    const totalOption = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
      .find(option => option.textContent?.includes("Total balance"))!;
    await act(async () => totalOption.click());

    expect(container.querySelector('.financial-summary-card__view-label')?.textContent).toBe("Total balance");
    expect([...container.querySelectorAll(".financial-summary-card__value")].map(value => value.textContent)).toEqual([
      "8,825,121.57",
      "528,235.10",
      "456,755.11",
    ]);

    await openBalanceMenu();
    const selected = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
      .find(option => option.textContent?.includes("Total balance"));
    expect(selected?.getAttribute("aria-checked")).toBe("true");
  });

  it("formats empty currencies as zero without converting the populated currency", async () => {
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

    expect([...container.querySelectorAll(".financial-summary-card__value")].map(value => value.textContent)).toEqual([
      "0.50",
      "0.00",
      "0.00",
    ]);

    await openBalanceMenu();
    const totalOption = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
      .find(option => option.textContent?.includes("Total balance"))!;
    await act(async () => totalOption.click());
    expect([...container.querySelectorAll(".financial-summary-card__value")].map(value => value.textContent)).toEqual([
      "-1.50",
      "0.00",
      "0.00",
    ]);
  });

  it("preserves complete formatting for large safe-integer balances", async () => {
    const sourceAccount = bankFinanceEnvironment.accounts.find(account => account.currency === "GBP")!;
    const baseline: FinanceDataset = {
      ...bankFinanceEnvironment,
      accounts: [{ ...sourceAccount, status: "active" }],
      balances: [{
        id: "balance-large-values",
        accountId: sourceAccount.id,
        asOf: "2026-10-15T00:00:00Z",
        currency: "GBP",
        ledgerBalanceMinor: 987_654_321_098_765,
        availableBalanceMinor: 123_456_789_012_345,
      }],
    };
    await renderSummary(baseline);

    expect(summaryText()).toContain("1,234,567,890,123.45");
    expect(summaryText()).not.toContain("9,876,543,210,987.65");

    await openBalanceMenu();
    const totalOption = [...document.body.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
      .find(option => option.textContent?.includes("Total balance"))!;
    await act(async () => totalOption.click());
    expect(summaryText()).toContain("9,876,543,210,987.65");
  });

  it("does not change accounts table behaviour", async () => {
    await act(async () => root.render(
      <BankStateProvider>
        <FinancialSummary />
        <AccountsDataTable accounts={getBankAccounts()} />
      </BankStateProvider>,
    ));
    const availableSort = [...container.querySelectorAll<HTMLButtonElement>(".accounts-table button")]
      .find(button => button.getAttribute("aria-label") === "Sort by Available balance")!;
    await act(async () => availableSort.click());
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

    expect(summaryText()).toContain("8,165,566.73");
    expect(container.querySelector(".accounts-heading")?.textContent).toContain("29 accounts");
    expect(baselineBalance.availableBalanceMinor).toBe(originalAvailable);
  });
});
