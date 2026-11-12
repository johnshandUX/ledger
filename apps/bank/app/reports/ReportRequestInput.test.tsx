// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ReportRequestInput } from "./ReportRequestInput";

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<ReportRequestInput />));
});

afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe("ReportRequestInput", () => {
  it("starts empty without visible instructional copy", () => {
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    expect(textarea.value).toBe("");
    expect(textarea.hasAttribute("placeholder")).toBe(false);
    expect(container.textContent).not.toContain("Describe the information you need");
    expect(container.textContent).not.toContain("Report preparation is not available");
  });

  it("populates the request when a suggested prompt is selected", async () => {
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    const suggestion = [...container.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent === "Monthly account balances")!;
    await act(async () => suggestion.click());
    expect(textarea.value).toBe("Monthly account balances");
  });

  it("accepts typed input while keeping report preparation explicitly unavailable", async () => {
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea")!;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    await act(async () => { setter?.call(textarea, "Payments above £10,000"); textarea.dispatchEvent(new Event("input", { bubbles: true })); });
    expect(textarea.value).toBe("Payments above £10,000");
    expect(container.querySelector<HTMLButtonElement>('button[aria-label^="Prepare report"]')?.disabled).toBe(true);
    expect(container.textContent).not.toContain("Report preparation is not available");
  });
});
