import { describe, expect, it } from "vitest";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "../finance/environment";
import { initialReportConfiguration, type ReportConfiguration } from "./configuration";
import { createMonthlySchedule, generateOneOffReport } from "./operations";

function dependencies(iso = "2026-11-12T12:00:00Z") { let sequence = 0; return { now: new Date(iso), nextId: (kind: "definition" | "run" | "output" | "schedule") => `${kind}-${++sequence}` }; }
const valid: ReportConfiguration = { ...initialReportConfiguration, selectedAccountIds: ["account-uk-customer-receipts"] };

describe("reporting operations", () => {
  it("generates a completed immutable report snapshot with a default name", () => {
    const generated = generateOneOffReport(bankFinanceEnvironment, valid, BANK_BUSINESS_ID, dependencies());
    expect(generated.definition.name).toBe("Transaction activity · October 2026");
    expect(generated.run.status).toBe("completed");
    expect(generated.output.recordCount).toBe(generated.queryResult.rows.length);
    expect(generated.output.serializedCsv).toContain("Transaction date");
    const snapshot = generated.output.serializedCsv;
    expect(generateOneOffReport(bankFinanceEnvironment, { ...valid, filters: { ...valid.filters, minimumAmount: "999999999" } }, BANK_BUSINESS_ID, dependencies()).output.recordCount).toBe(0);
    expect(generated.output.serializedCsv).toBe(snapshot);
  });

  it("rejects invalid configuration", () => {
    expect(() => generateOneOffReport(bankFinanceEnvironment, initialReportConfiguration, BANK_BUSINESS_ID, dependencies())).toThrow(/Invalid report configuration/);
  });

  it("resolves complete months using the Europe/London calendar", () => {
    const generated = generateOneOffReport(bankFinanceEnvironment, valid, BANK_BUSINESS_ID, dependencies("2026-06-30T23:30:00Z"));
    expect(generated.run.reportingPeriod).toEqual({ from: "2026-06-01", to: "2026-06-30" });
  });

  it("creates an active illustrative monthly schedule without a run", () => {
    const recurring: ReportConfiguration = { ...valid, mode: "recurring", reportName: "Monthly receipts", period: { kind: "previous-calendar-month" }, schedule: { ...valid.schedule, delivery: "caldermere-finance-erp", executionDay: "15", executionTime: "09:00" } };
    const created = createMonthlySchedule(bankFinanceEnvironment, recurring, BANK_BUSINESS_ID, dependencies());
    expect(created.definition.reportingPeriod).toEqual({ rule: "previous-calendar-month" });
    expect(created.schedule).toMatchObject({ status: "active", frequency: "monthly", delivery: "caldermere-finance-erp", executionDay: "15", executionTime: "09:00" });
    expect(created.schedule.nextScheduledRun).toBe("2026-11-15T09:00:00.000Z");
  });

  it("rejects recurring schedules for unknown accounts", () => {
    const recurring: ReportConfiguration = { ...valid, mode: "recurring", reportName: "Monthly receipts", selectedAccountIds: ["missing-account"], period: { kind: "previous-calendar-month" } };
    expect(() => createMonthlySchedule(bankFinanceEnvironment, recurring, BANK_BUSINESS_ID, dependencies())).toThrow(/Unknown or inaccessible/);
  });
});
