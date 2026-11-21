import { describe, expect, it } from "vitest";
import { createReportingState, reportingReducer } from "./state";
import type { GeneratedReportOutput, RecurringReportSchedule, ReportDefinition, ReportRun } from "./types";
import { initialReportConfiguration } from "./configuration";

const definition: ReportDefinition = { id: "definition-1", name: "Report", reportType: "transaction-activity", selectedAccountIds: ["account-1"], reportingPeriod: { from: "2026-10-01", to: "2026-10-31" }, direction: "all", outputFormat: "csv", createdAt: "2026-11-01T00:00:00Z", organisationId: "business-1" };
const run: ReportRun = { id: "run-1", definitionId: definition.id, executedAt: definition.createdAt, reportingPeriod: { from: "2026-10-01", to: "2026-10-31" }, status: "completed", matchingRecordCount: 0, completedAt: definition.createdAt, outputId: "output-1" };
const output: GeneratedReportOutput = { id: "output-1", runId: run.id, filename: "report.csv", format: "csv", recordCount: 0, createdAt: definition.createdAt, rows: [], serializedCsv: "headers" };
const schedule: RecurringReportSchedule = { id: "schedule-1", definitionId: definition.id, frequency: "monthly", executionDay: "1", executionTime: "06:00", timezone: "Europe/London", reportingPeriodRule: "previous-calendar-month", delivery: "my-reports", nextScheduledRun: "2026-12-01T06:00:00Z", status: "active", createdAt: definition.createdAt };

describe("reporting state", () => {
  it("adds a generated report atomically and ignores a duplicate definition action", () => {
    const initial = createReportingState();
    const action = { type: "report-generated" as const, definition, run, output };
    const next = reportingReducer(initial, action);
    expect(next).toEqual({ definitions: [definition], runs: [run], outputs: [output], schedules: [] });
    expect(reportingReducer(next, action)).toBe(next);
    expect(initial).toEqual(createReportingState());
  });

  it("keeps schedules distinct from report runs and outputs", () => {
    const created = reportingReducer(createReportingState(), { type: "schedule-created", definition, schedule });
    expect(created).toEqual({ definitions: [definition], schedules: [schedule], runs: [], outputs: [], latestCreatedScheduleId: schedule.id });
    expect(reportingReducer(created, { type: "schedule-confirmation-consumed", scheduleId: schedule.id })).toEqual({ ...created, latestCreatedScheduleId: undefined });
  });

  it("holds one cloned assisted configuration until the creation workspace consumes it", () => {
    const configuration = { ...initialReportConfiguration, selectedAccountIds: ["account-1"], direction: "outgoing" as const, filters: { ...initialReportConfiguration.filters, minimumAmount: "5000.01" } };
    const prepared = reportingReducer(createReportingState(), { type: "assisted-configuration-prepared", configuration });
    expect(prepared.assistedConfiguration).toEqual(configuration);
    expect(prepared.assistedConfiguration).not.toBe(configuration);
    expect(reportingReducer(prepared, { type: "assisted-configuration-consumed" }).assistedConfiguration).toBeUndefined();
    expect(createReportingState().assistedConfiguration).toBeUndefined();
  });
});
