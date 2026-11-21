// @vitest-environment happy-dom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { GeneratedReportOutput, ReportDefinition, ReportRun } from "../src/reporting/types";
import { ReportingStateProvider, useReportingDispatch, useReportingState } from "./ReportingStateProvider";
import { initialReportConfiguration } from "../src/reporting/configuration";

const definition: ReportDefinition = { id: "definition-1", name: "Created report", reportType: "transaction-activity", selectedAccountIds: ["account-1"], reportingPeriod: { from: "2026-10-01", to: "2026-10-31" }, direction: "all", outputFormat: "csv", createdAt: "2026-11-01T00:00:00Z", organisationId: "business-1" };
const run: ReportRun = { id: "run-1", definitionId: definition.id, executedAt: definition.createdAt, reportingPeriod: { from: "2026-10-01", to: "2026-10-31" }, status: "completed", matchingRecordCount: 0, completedAt: definition.createdAt, outputId: "output-1" };
const output: GeneratedReportOutput = { id: "output-1", runId: run.id, filename: "report.csv", format: "csv", recordCount: 0, createdAt: definition.createdAt, rows: [], serializedCsv: "headers" };

function Probe({ view }: { view: string }) {
  const state = useReportingState();
  const dispatch = useReportingDispatch();
  return <div><span>{view}:{state.definitions.map(item => item.name).join(",") || "seed"}:{state.assistedConfiguration ? "assisted" : "manual"}</span><button onClick={() => dispatch({ type: "report-generated", definition, run, output })}>Generate</button><button onClick={() => dispatch({ type: "assisted-configuration-prepared", configuration: { ...initialReportConfiguration, selectedAccountIds: ["account-1"] } })}>Prepare assisted</button></div>;
}

describe("ReportingStateProvider lifetime", () => {
  let container: HTMLDivElement;
  let root: Root;
  beforeEach(() => { (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement("div"); document.body.append(container); root = createRoot(container); });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); });

  it("preserves reports when route content changes beneath one provider", async () => {
    await act(async () => root.render(<ReportingStateProvider><Probe view="reports" /></ReportingStateProvider>));
    await act(async () => container.querySelector("button")!.click());
    await act(async () => root.render(<ReportingStateProvider><Probe view="accounts" /></ReportingStateProvider>));
    expect(container.textContent).toContain("accounts:Created report:manual");
  });

  it("resets on provider remount and isolates independent instances", async () => {
    await act(async () => root.render(<ReportingStateProvider><Probe view="first" /></ReportingStateProvider>));
    await act(async () => container.querySelector("button")!.click());
    await act(async () => [...container.querySelectorAll("button")].find(button => button.textContent === "Prepare assisted")!.click());
    await act(async () => root.render(<div />));
    await act(async () => root.render(<ReportingStateProvider><Probe view="fresh" /></ReportingStateProvider>));
    expect(container.textContent).toContain("fresh:seed:manual");
  });
});
