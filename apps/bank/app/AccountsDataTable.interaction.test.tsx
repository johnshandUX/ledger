// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getBankAccounts } from "../src/finance/accounts";
import { AccountsDataTable } from "./AccountsDataTable";
import { BankStateProvider } from "./BankStateProvider";

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(
    <BankStateProvider><AccountsDataTable accounts={getBankAccounts()} /></BankStateProvider>,
  ));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

async function setSelectValue(select: HTMLSelectElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set?.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function click(element: HTMLElement) {
  await act(async () => element.click());
}

function mobile() {
  const element = container.querySelector<HTMLElement>(".accounts-mobile");
  if (!element) throw new Error("Missing mobile accounts presentation");
  return element;
}

function firstCardName() {
  return mobile().querySelector<HTMLElement>(".acc-name")?.textContent;
}

describe("mobile accounts interactions", () => {
  it("preserves every sort option and reorders cards in both directions", async () => {
    const select = mobile().querySelector<HTMLSelectElement>("select")!;
    expect(select.getAttribute("aria-label")).toBeNull();
    expect(mobile().querySelector(`label[for="${select.id}"]`)?.textContent).toBe("Sort accounts by");
    expect([...select.options].map(option => [option.value, option.textContent])).toEqual([
      ["source", "Default order"],
      ["account", "Account"],
      ["type", "Account type"],
      ["currentBalance", "Current balance"],
      ["availableBalance", "Available balance"],
    ]);

    expect(firstCardName()).toBe("Main Operating Account");
    await setSelectValue(select, "availableBalance");
    expect(firstCardName()).toBe("Restricted Project Account — Regional Innovation Grant");

    const direction = mobile().querySelector<HTMLButtonElement>('[aria-label="Sort ascending; change to descending"]')!;
    expect(direction).not.toBeNull();
    expect(direction.textContent).toBe("");
    await click(direction);
    expect(firstCardName()).toBe("Strategic Liquidity Deposit");

    await setSelectValue(select, "source");
    expect(firstCardName()).toBe("Main Operating Account");
    expect(mobile().querySelector(".mobile-table-direction")).toBeNull();
  });

  it("renders one correct details route per account card", () => {
    const accounts = getBankAccounts();
    const links = [...mobile().querySelectorAll<HTMLAnchorElement>(".acc-card")];

    expect(links).toHaveLength(accounts.length);
    expect(links.map(link => link.getAttribute("href"))).toEqual(
      accounts.map(account => `/accounts/${account.id}`),
    );
  });
});
