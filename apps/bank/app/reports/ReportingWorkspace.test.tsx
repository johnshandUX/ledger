// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ReportingWorkspace } from "./ReportingWorkspace";

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<ReportingWorkspace />));
});

afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe("ReportingWorkspace", () => {
  it("selects My reports by default with an associated tabpanel", () => {
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const panels = container.querySelectorAll<HTMLElement>('[role="tabpanel"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[0]?.tabIndex).toBe(0);
    expect(tabs[1]?.tabIndex).toBe(-1);
    expect(panels).toHaveLength(2);
    expect(tabs[0]?.getAttribute("aria-controls")).toBe(panels[0]?.id);
    expect(tabs[1]?.getAttribute("aria-controls")).toBe(panels[1]?.id);
    expect(panels[0]?.getAttribute("aria-labelledby")).toBe(tabs[0]?.id);
    expect(panels[0]?.hidden).toBe(false);
    expect(panels[1]?.hidden).toBe(true);
    expect(panels[0]?.textContent).toContain("Monthly transaction report");
  });

  it("switches to Connected reporting and exposes the ERP data", async () => {
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await act(async () => tabs[1]?.click());
    const panels = container.querySelectorAll<HTMLElement>('[role="tabpanel"]');
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
    expect(panels[0]?.hidden).toBe(true);
    expect(panels[1]?.hidden).toBe(false);
    expect(panels[1]?.textContent).toContain("Caldermere Finance ERP");
    expect(panels[1]?.textContent).toContain("Daily account transactions");
    expect(panels[1]?.textContent).toContain("Scheduled file delivery");
  });

  it("supports arrow-key tab selection and focus", async () => {
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[0]?.focus();
    await act(async () => tabs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[1]);
  });
});
