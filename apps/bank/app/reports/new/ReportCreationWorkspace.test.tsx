// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBankAccounts } from "../../../src/finance/accounts";
import { BankStateProvider } from "../../BankStateProvider";
import { ReportingStateProvider } from "../../ReportingStateProvider";
import { ReportCreationWorkspace } from "./ReportCreationWorkspace";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  push.mockClear();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<BankStateProvider><ReportingStateProvider><ReportCreationWorkspace accounts={getBankAccounts()} today="2026-11-12" /></ReportingStateProvider></BankStateProvider>));
});
afterEach(async () => { await act(async () => root.unmount()); document.body.innerHTML = ""; });

function button(name: string) { return [...document.querySelectorAll<HTMLButtonElement>("button")].find(item => item.textContent?.trim() === name)!; }
function change(input: HTMLInputElement | HTMLSelectElement, value: string) { const prototype = input instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value); input.dispatchEvent(new Event("change", { bubbles: true })); input.dispatchEvent(new Event("input", { bubbles: true })); }

describe("ReportCreationWorkspace", () => {
  it("renders the truthful initial workspace and non-operational action", () => {
    expect(container.querySelector("h1")?.textContent).toBe("Create report");
    expect(container.textContent).toContain("Select at least one account to continue.");
    expect(button("Generate report").disabled).toBe(true);
    expect(container.textContent).not.toContain("Report created");
  });

  it("confirms account selection and discards cancelled draft changes", async () => {
    await act(async () => button("Select").click());
    const first = document.querySelector<HTMLInputElement>('.report-account-option input[type="checkbox"]')!;
    await act(async () => first.click());
    await act(async () => button("Cancel").click());
    expect(container.textContent).toContain("Select accounts");
    await act(async () => button("Select").click());
    await act(async () => document.querySelector<HTMLInputElement>('.report-account-option input[type="checkbox"]')!.click());
    await act(async () => button("Confirm selection").click());
    expect(container.textContent).toContain("1 account selected");
  });

  it("switches recurring mode, moving period, action label and schedule summary together", async () => {
    const recurring = container.querySelector<HTMLInputElement>("#recurring-report")!;
    await act(async () => recurring.click());
    expect(container.textContent).toContain("Previous calendar month");
    expect(button("Create schedule").disabled).toBe(true);
    const execution = [...container.querySelectorAll<HTMLSelectElement>("select")].find(select => select.labels?.[0]?.textContent === "Execution time")!;
    await act(async () => change(execution, "18:00"));
    expect(container.textContent).toContain("at 18:00 (Europe/London), covering the previous calendar month");
    expect(container.textContent).toContain("Enter a report name for this recurring report.");
    expect(container.textContent).toContain("Send to Caldermere Finance ERP");
    expect(container.textContent).not.toContain("illustrative only");
  });

  it("keeps desktop selections across pages and search, exposes mixed state, and clears every page", async () => {
    await act(async () => button("Select").click());
    const table = document.querySelector<HTMLElement>(".report-account-table")!;
    const selectAll = table.querySelector<HTMLInputElement>('thead input[type="checkbox"]')!;
    await act(async () => selectAll.click());
    expect(document.body.textContent).toContain("10 of");
    await act(async () => table.querySelector<HTMLButtonElement>('button[aria-label="Next page"]')!.click());
    const nextPageRow = table.querySelector<HTMLInputElement>('tbody input[type="checkbox"]')!;
    await act(async () => nextPageRow.click());
    expect(table.querySelector<HTMLInputElement>('thead input[type="checkbox"]')!.indeterminate).toBe(true);
    const search = table.querySelector<HTMLInputElement>('input[type="search"]')!;
    await act(async () => change(search, "Operating"));
    expect(document.body.textContent).toContain("selected");
    await act(async () => button("Clear selection").click());
    expect(document.body.textContent).toContain("0 of");
  });

  it("updates direction and exposes custom-date and amount validation", async () => {
    const incoming = container.querySelector<HTMLInputElement>("#direction-incoming")!;
    await act(async () => incoming.click());
    expect(container.querySelector(".report-summary")?.textContent).toContain("Incoming");
    await act(async () => container.querySelector<HTMLInputElement>("#period-custom")!.click());
    expect(container.textContent).toContain("Enter a From date.");
    expect(container.textContent).toContain("Enter a To date.");
    await act(async () => button("Add filters").click());
    await act(async () => change(container.querySelector<HTMLInputElement>("#minimum-amount")!, "-1"));
    expect(container.textContent).toContain("zero or more");
  });

  it("applies mobile search to visible-set selection and exposes the mixed state", async () => {
    await act(async () => button("Select").click());
    const mobile = document.querySelector<HTMLElement>(".report-account-mobile-list")!;
    const search = mobile.querySelector<HTMLInputElement>('input[type="search"]')!;
    const firstAccountName = getBankAccounts().find(account => account.status !== "closed")!.name;
    await act(async () => change(search, firstAccountName));
    const selectShown = mobile.querySelector<HTMLInputElement>('.report-account-mobile-select-all input')!;
    await act(async () => selectShown.click());
    expect(selectShown.checked).toBe(true);
    await act(async () => change(search, ""));
    expect(selectShown.indeterminate).toBe(true);
  });

  it("generates one completed report from the live preview exactly once", async () => {
    await act(async () => button("Select").click());
    await act(async () => document.querySelector<HTMLInputElement>('.report-account-option input[type="checkbox"]')!.click());
    await act(async () => button("Confirm selection").click());
    const generate = button("Generate report");
    expect(generate.disabled).toBe(false);
    await act(async () => generate.click());
    expect(container.textContent).toContain("Report created");
    expect(container.textContent).toContain("Download CSV");
    expect(button("Generate report").disabled).toBe(true);
  });

  it("creates an active monthly schedule when recurrence requirements are complete", async () => {
    await act(async () => button("Select").click());
    await act(async () => document.querySelector<HTMLInputElement>('.report-account-option input[type="checkbox"]')!.click());
    await act(async () => button("Confirm selection").click());
    await act(async () => container.querySelector<HTMLInputElement>("#recurring-report")!.click());
    await act(async () => change(container.querySelector<HTMLInputElement>("#report-name")!, "Monthly activity"));
    const create = button("Create schedule");
    expect(create.disabled).toBe(false);
    await act(async () => create.click());
    expect(push).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/reports");
  });

  it("routes an ERP schedule to Connected reporting without duplicate submission", async () => {
    await act(async () => button("Select").click());
    await act(async () => document.querySelector<HTMLInputElement>('.report-account-option input[type="checkbox"]')!.click());
    await act(async () => button("Confirm selection").click());
    await act(async () => container.querySelector<HTMLInputElement>("#recurring-report")!.click());
    await act(async () => change(container.querySelector<HTMLInputElement>("#report-name")!, "ERP monthly activity"));
    await act(async () => container.querySelector<HTMLInputElement>("#delivery-erp")!.click());
    const create = button("Create schedule");
    await act(async () => { create.click(); create.click(); });
    expect(push).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/reports?tab=connected");
  });
});
