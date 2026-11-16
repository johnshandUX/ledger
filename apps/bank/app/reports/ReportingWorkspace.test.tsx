// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BANK_BUSINESS_ID } from "../../src/finance/environment";
import type { GeneratedReportOutput, RecurringReportSchedule, ReportDefinition, ReportRun } from "../../src/reporting/types";
import { BankStateProvider } from "../BankStateProvider";
import { ReportingStateProvider, useReportingDispatch } from "../ReportingStateProvider";
import { ReportingWorkspace, reportingTabFromParam } from "./ReportingWorkspace";

let tabParam: string | null = null;
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), useSearchParams: () => ({ get: (key: string) => key === "tab" ? tabParam : null }) }));

let container: HTMLDivElement;
let root: Root;
const definition: ReportDefinition = { id: "definition-created", name: "Created transaction report", reportType: "transaction-activity", selectedAccountIds: ["account-main-operating"], reportingPeriod: { from: "2026-10-01", to: "2026-10-31" }, direction: "all", outputFormat: "csv", createdAt: "2026-11-12T10:00:00Z", organisationId: BANK_BUSINESS_ID };
const run: ReportRun = { id: "run-created", definitionId: definition.id, executedAt: definition.createdAt, reportingPeriod: { from: "2026-10-01", to: "2026-10-31" }, status: "completed", matchingRecordCount: 1, completedAt: definition.createdAt, outputId: "output-created" };
const output: GeneratedReportOutput = { id: "output-created", runId: run.id, filename: "created.csv", format: "csv", recordCount: 1, createdAt: definition.createdAt, rows: [], serializedCsv: "csv" };
const myDefinition: ReportDefinition = { ...definition, id: "definition-my-schedule", name: "My monthly activity", reportingPeriod: { rule: "previous-calendar-month" } };
const erpDefinition: ReportDefinition = { ...definition, id: "definition-erp-schedule", name: "ERP monthly activity", reportingPeriod: { rule: "previous-calendar-month" } };
const schedule = (id: string, definitionId: string, delivery: RecurringReportSchedule["delivery"]): RecurringReportSchedule => ({ id, definitionId, frequency: "monthly", executionDay: "1", executionTime: "06:00", timezone: "Europe/London", reportingPeriodRule: "previous-calendar-month", delivery, nextScheduledRun: "2026-12-01T06:00:00Z", status: "active", createdAt: definition.createdAt });
const mySchedule = schedule("schedule-my", myDefinition.id, "my-reports");
const erpSchedule = schedule("schedule-erp", erpDefinition.id, "caldermere-finance-erp");

function Harness() {
  const dispatch = useReportingDispatch();
  return <><button onClick={() => dispatch({ type: "report-generated", definition, run, output })}>Seed report</button><button onClick={() => dispatch({ type: "schedule-created", definition: myDefinition, schedule: mySchedule })}>Seed My schedule</button><button onClick={() => dispatch({ type: "schedule-created", definition: erpDefinition, schedule: erpSchedule })}>Seed ERP schedule</button><ReportingWorkspace /></>;
}
async function render() { await act(async () => root.render(<BankStateProvider><ReportingStateProvider><Harness /></ReportingStateProvider></BankStateProvider>)); }

beforeEach(async () => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  tabParam = null;
  push.mockClear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await render();
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

describe("ReportingWorkspace", () => {
  it("selects tabs from the query parameter with invalid values falling back to My reports", async () => {
    expect(reportingTabFromParam(null)).toBe("my-reports");
    expect(reportingTabFromParam("invalid")).toBe("my-reports");
    expect(reportingTabFromParam("connected")).toBe("connected-reporting");
    tabParam = "connected";
    await render();
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
    expect(container.querySelectorAll<HTMLElement>('[role="tabpanel"]')[1]?.hidden).toBe(false);
  });

  it("routes click and keyboard tab changes while preserving accessible focus behavior", async () => {
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await act(async () => tabs[1]?.click());
    expect(push).toHaveBeenLastCalledWith("/reports?tab=connected");
    tabs[0]?.focus();
    await act(async () => { tabs[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); await new Promise(resolve => setTimeout(resolve, 1)); });
    expect(push).toHaveBeenLastCalledWith("/reports?tab=connected");
    expect(document.activeElement).toBe(tabs[1]);
  });

  it("shows one-off reports and only My reports schedules in My reports", async () => {
    const actions = [...container.querySelectorAll<HTMLButtonElement>("button")];
    await act(async () => actions.find(button => button.textContent === "Seed report")!.click());
    await act(async () => actions.find(button => button.textContent === "Seed My schedule")!.click());
    await act(async () => actions.find(button => button.textContent === "Seed ERP schedule")!.click());
    const panel = container.querySelectorAll<HTMLElement>('[role="tabpanel"]')[0]!;
    expect(panel.textContent).toContain("Created transaction report");
    expect(panel.textContent).toContain("Download CSV");
    expect(panel.textContent).toContain("My monthly activity");
    expect(panel.textContent).toContain("Recurring · Monthly");
    expect(panel.textContent).toContain("Next run: 1 Dec 2026 at 06:00");
    expect(panel.textContent).not.toContain("Destination: My reports");
    expect(panel.textContent).not.toContain("ERP monthly activity");
    expect(panel.textContent).toContain("Active");
    const scheduleRow = [...panel.querySelectorAll("tr")].find(row => row.textContent?.includes("My monthly activity"))!;
    expect(scheduleRow.textContent).not.toContain("Download CSV");
    expect(scheduleRow.textContent).not.toContain("12 Nov 2026");
    const scheduleCard = [...panel.querySelectorAll("li")].find(card => card.textContent?.includes("My monthly activity"))!;
    expect(scheduleCard.textContent).not.toContain("12 Nov 2026");
    expect(panel.querySelector("table")?.getAttribute("aria-label")).toBe("Reports for Caldermere Ltd");
  });

  it("places ERP schedules alongside seeded processes without fabricated deliveries", async () => {
    await act(async () => [...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Seed ERP schedule")!.click());
    tabParam = "connected";
    await render();
    const panel = container.querySelectorAll<HTMLElement>('[role="tabpanel"]')[1]!;
    expect(panel.textContent).toContain("4 automated reporting processes");
    expect(panel.textContent).toContain("ERP monthly activity");
    expect(panel.textContent).toContain("Monthly");
    expect(panel.textContent).toContain("Next run: 1 Dec 2026 at 06:00");
    expect(panel.textContent).toContain("Active");
    expect(panel.textContent).toContain("Daily account transactions");
    const createdRow = [...panel.querySelectorAll<HTMLElement>('[role="row"]')].find(row => row.textContent?.includes("ERP monthly activity"))!;
    expect(createdRow.textContent).not.toContain("Destination: Caldermere Finance ERP");
    expect(createdRow.textContent).not.toContain("Delivered");
    expect(panel.textContent).toContain("Your monthly report is now listed under Caldermere Finance ERP.");
  });
});
