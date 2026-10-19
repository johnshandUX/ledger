// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BankTransaction } from "../../../src/finance/transactions";
import { TransactionHistory } from "./TransactionHistory";

let container: HTMLDivElement;
let root: Root;
let mobileViewport = false;
let viewportListener: (() => void) | undefined;

const transactions: BankTransaction[] = Array.from({ length: 61 }, (_, index) => ({
  id: `transaction-${String(index).padStart(2, "0")}`,
  accountId: "account",
  direction: index % 2 ? "debit" : "credit",
  amountMinor: (index + 1) * 100,
  currency: "GBP",
  bookedAt: `2026-09-${String(1 + (index % 28)).padStart(2, "0")}T10:00:00Z`,
  valueDate: "2026-09-01",
  description: index === 0 ? "Unique invoice" : `Transaction ${index}`,
}));

beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  mobileViewport = false;
  viewportListener = undefined;
  Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ get matches() { return mobileViewport; }, media: "(max-width: 1100px)", onchange: null, addEventListener: (_: string, listener: () => void) => { viewportListener = listener; }, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => true }) });
  window.history.replaceState(null, "", "/accounts/account?unrelated=keep");
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});

afterEach(async () => {
  vi.useRealTimers();
  await act(async () => root.unmount());
  container.remove();
});

async function render(initialSearchParams: Record<string, string> = {}) {
  await act(async () => root.render(<TransactionHistory transactions={transactions} initialSearchParams={initialSearchParams} />));
}

async function changeInput(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

describe("TransactionHistory interactions", () => {
  it("debounces typing, applies Enter immediately, and prevents a stale query after clear", async () => {
    vi.useFakeTimers(); await render();
    const search = container.querySelector<HTMLInputElement>('input[type="search"]')!;
    await changeInput(search, "Unique");
    expect(container.textContent).toContain("61 matching transactions");
    await act(async () => vi.advanceTimersByTime(250));
    expect(container.textContent).toContain("1 matching transaction");
    expect(window.location.search).toContain("txQuery=Unique");

    await changeInput(search, "Transaction 4");
    await act(async () => search.form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(container.textContent).toContain("Transaction 4");
    await changeInput(search, "");
    await act(async () => vi.advanceTimersByTime(250));
    expect(container.textContent).toContain("61 matching transactions");
    expect(window.location.search).not.toContain("txQuery");
  });

  it("preserves unrelated parameters and restores state on browser navigation", async () => {
    await render();
    const moneyOut = container.querySelector<HTMLButtonElement>('button[aria-label="Filter by money out"]')!;
    await act(async () => moneyOut.click());
    expect(window.location.search).toContain("unrelated=keep");
    expect(window.location.search).toContain("txDirection=debit");
    expect(container.textContent).toContain("30 matching transactions");

    window.history.replaceState(null, "", "/accounts/account?unrelated=keep&txDirection=credit&txSort=oldest");
    await act(async () => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(container.querySelector<HTMLButtonElement>('button[aria-label="Clear money in filter"]')?.getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector<HTMLButtonElement>('button[aria-label="Filter by money out"]')?.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector<HTMLSelectElement>('select')?.value).toBe("oldest");
    expect(container.textContent).toContain("31 matching transactions");
  });

  it("toggles and switches the mutually exclusive direction buttons", async () => {
    await render();
    const moneyIn = () => Array.from(container.querySelectorAll<HTMLButtonElement>(".transaction-direction-button")).find(button => button.textContent === "In")!;
    const moneyOut = () => Array.from(container.querySelectorAll<HTMLButtonElement>(".transaction-direction-button")).find(button => button.textContent === "Out")!;
    expect(moneyIn().getAttribute("aria-pressed")).toBe("false");
    expect(moneyOut().getAttribute("aria-pressed")).toBe("false");
    expect(window.location.search).not.toContain("txDirection");

    await act(async () => moneyIn().click());
    expect(moneyIn().getAttribute("aria-pressed")).toBe("true");
    expect(moneyOut().getAttribute("aria-pressed")).toBe("false");
    expect(container.textContent).toContain("31 matching transactions");
    expect(window.location.search).toContain("txDirection=credit");

    await act(async () => moneyOut().click());
    expect(moneyIn().getAttribute("aria-pressed")).toBe("false");
    expect(moneyOut().getAttribute("aria-pressed")).toBe("true");
    expect(container.textContent).toContain("30 matching transactions");
    expect(window.location.search).toContain("txDirection=debit");

    await act(async () => moneyOut().click());
    expect(moneyIn().getAttribute("aria-pressed")).toBe("false");
    expect(moneyOut().getAttribute("aria-pressed")).toBe("false");
    expect(container.textContent).toContain("61 matching transactions");
    expect(window.location.search).not.toContain("txDirection");
  });

  it("clears either active direction and resets mobile batching", async () => {
    mobileViewport = true;
    await render();
    await act(async () => container.querySelector<HTMLButtonElement>(".transaction-load-more")?.click());
    expect(container.querySelectorAll(".transaction-card")).toHaveLength(50);

    const moneyIn = () => Array.from(container.querySelectorAll<HTMLButtonElement>(".transaction-direction-button")).find(button => button.textContent === "In")!;
    await act(async () => moneyIn().click());
    expect(container.querySelectorAll(".transaction-card")).toHaveLength(25);
    expect(window.location.search).toContain("txDirection=credit");
    expect(window.location.search).not.toContain("txCount");
    await act(async () => moneyIn().click());
    expect(container.textContent).toContain("61 matching transactions");
    expect(window.location.search).not.toContain("txDirection");
  });

  it("Reset filters clears the active direction", async () => {
    await render();
    await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Filter by money out"]')?.click());
    const search = container.querySelector<HTMLInputElement>('input[type="search"]')!;
    await changeInput(search, "no matching transaction");
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 250)); });
    await act(async () => container.querySelector<HTMLButtonElement>(".transaction-no-results button")?.click());
    expect(container.querySelectorAll<HTMLButtonElement>('.transaction-direction-button[aria-pressed="true"]')).toHaveLength(0);
    expect(window.location.search).not.toContain("txDirection");
  });

  it("does not let a pending search overwrite restored browser state", async () => {
    vi.useFakeTimers(); await render();
    const search = container.querySelector<HTMLInputElement>('input[type="search"]')!;
    await changeInput(search, "Unique");
    window.history.replaceState(null, "", "/accounts/account?unrelated=keep&txDirection=debit");
    await act(async () => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(search.value).toBe("");
    expect(container.textContent).toContain("30 matching transactions");

    await act(async () => vi.advanceTimersByTime(250));
    expect(window.location.search).toContain("txDirection=debit");
    expect(window.location.search).not.toContain("txQuery");
    expect(container.textContent).toContain("30 matching transactions");
  });

  it("restores desktop pages and translates collection position across viewport modes", async () => {
    window.history.replaceState(null, "", "/accounts/account?unrelated=keep&txPage=3");
    await render({ txPage: "3", unrelated: "keep" });
    expect(window.location.search).toContain("txPage=3");
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("3");

    mobileViewport = true;
    await act(async () => viewportListener?.());
    expect(window.location.search).toContain("txCount=61");
    expect(window.location.search).not.toContain("txPage");
    expect(container.querySelectorAll(".transaction-card")).toHaveLength(61);
  });

  it("translates Back and Forward position parameters for the active viewport", async () => {
    mobileViewport = true;
    await render();
    window.history.replaceState(null, "", "/accounts/account?unrelated=keep&txPage=3");
    await act(async () => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(window.location.search).toContain("txCount=61");
    expect(window.location.search).not.toContain("txPage");
    expect(container.querySelectorAll(".transaction-card")).toHaveLength(61);

    mobileViewport = false;
    await act(async () => viewportListener?.());
    window.history.replaceState(null, "", "/accounts/account?unrelated=keep&txCount=50");
    await act(async () => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(window.location.search).toContain("txPage=2");
    expect(window.location.search).not.toContain("txCount");
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("2");
  });

  it("updates the live desktop page when an out-of-range URL is clamped", async () => {
    window.history.replaceState(null, "", "/accounts/account?txPage=99");
    await render({ txPage: "99" });
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 0)); });
    expect(window.location.search).toContain("txPage=3");
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("3");

    mobileViewport = true;
    await act(async () => viewportListener?.());
    expect(window.location.search).toContain("txCount=61");
    mobileViewport = false;
    await act(async () => viewportListener?.());
    expect(window.location.search).toContain("txPage=3");
  });
});
