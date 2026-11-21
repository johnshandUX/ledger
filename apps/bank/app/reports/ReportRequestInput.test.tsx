// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BankStateProvider } from "../BankStateProvider";
import { ReportingStateProvider, useReportingState } from "../ReportingStateProvider";
import { ReportRequestInput } from "./ReportRequestInput";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
let container: HTMLDivElement;
let root: Root;

function HandoffProbe() { const state = useReportingState(); return <output data-testid="handoff">{JSON.stringify(state.assistedConfiguration)}</output>; }
beforeEach(async () => {
  push.mockClear();
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await act(async () => root.render(<BankStateProvider><ReportingStateProvider><ReportRequestInput today="2026-11-20" /><HandoffProbe /></ReportingStateProvider></BankStateProvider>));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

async function enterRequest(value: string) {
  const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  await act(async () => { setter?.call(textarea, value); textarea.dispatchEvent(new Event("input", { bubbles: true })); });
  await act(async () => textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
}

describe("ReportRequestInput", () => {
  it("preserves the approved compact controlled input", () => {
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(textarea.value).toBe(""); expect(textarea.hasAttribute("placeholder")).toBe(false);
    expect(container.textContent).not.toContain("Describe the information you need");
    expect(container.querySelector<HTMLButtonElement>('button[aria-label="Prepare report"]')?.disabled).toBe(true);
  });

  it("populates the request from a supported suggestion", async () => {
    const suggestion = [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Outgoing transactions across all GBP accounts last month")!;
    await act(async () => suggestion.click());
    expect(container.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe(suggestion.textContent);
  });

  it("shows the request, grounded clarification choices and follow-up interaction", async () => {
    await enterRequest("Create a transaction report for our operating accounts");
    expect(container.textContent).toContain("Create a transaction report for our operating accounts");
    expect(container.textContent).toContain("Which accounts would you like to include?");
    const all = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(input => input.labels?.[0]?.textContent?.includes("matching accounts"))!;
    await act(async () => all.click());
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Confirm")!.click());
    expect(container.textContent).toContain("Which reporting period would you like?");
  });

  it("prepares a real configuration and hands it to the existing workspace route", async () => {
    await enterRequest("Transaction activity for Main Operating Account last month");
    const keep = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')].find(input => input.labels?.[0]?.textContent?.includes("Keep requested dates"))!;
    await act(async () => keep.click());
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Confirm")!.click());
    expect(container.textContent).toContain("Report configuration prepared");
    expect(container.textContent).toContain("Main Operating Account");
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Review report")!.click());
    expect(push).toHaveBeenCalledWith("/reports/new");
    expect(container.querySelector('[data-testid="handoff"]')?.textContent).toContain("account-main-operating");
    expect(container.textContent).not.toContain("Report created");
  });
});
