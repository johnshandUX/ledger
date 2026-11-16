import { describe, expect, it } from "vitest";
import { initialReportConfiguration, scheduleSummary, validateReportConfiguration } from "./report-configuration";

describe("report configuration", () => {
  it("starts as a one-off CSV transaction report without fabricated selections", () => {
    expect(initialReportConfiguration).toMatchObject({ reportType: "transaction-activity", selectedAccountIds: [], outputFormat: "csv", mode: "one-off", period: { kind: "last-month" } });
  });

  it("validates custom dates and optional amount bounds", () => {
    const errors = validateReportConfiguration({ ...initialReportConfiguration, selectedAccountIds: ["account-1"], period: { kind: "custom", from: "2026-12-01", to: "2026-11-01" }, filters: { minimumAmount: "100", maximumAmount: "10", currency: "" } }, "2026-11-12");
    expect(errors.from).toContain("future");
    expect(errors.to).toContain("on or after");
    expect(errors.maximumAmount).toContain("at least");
  });

  it("requires a name only for recurring reports and derives the schedule summary", () => {
    const recurring = { ...initialReportConfiguration, mode: "recurring" as const, selectedAccountIds: ["account-1"], period: { kind: "previous-calendar-month" as const }, schedule: { ...initialReportConfiguration.schedule, executionDay: "last" as const, executionTime: "18:00" as const } };
    expect(validateReportConfiguration(recurring, "2026-11-12").reportName).toContain("report name");
    expect(validateReportConfiguration({ ...recurring, reportName: "Monthly activity" }, "2026-11-12").reportName).toBeUndefined();
    expect(scheduleSummary(recurring)).toBe("Runs on the last day of every month at 18:00 (Europe/London), covering the previous calendar month.");
  });

  it("rejects unsafe amounts and invalid assisted schedule values at runtime", () => {
    const unsafe = { ...initialReportConfiguration, selectedAccountIds: ["account-1"], filters: { ...initialReportConfiguration.filters, minimumAmount: "999999999999999999.99" } };
    expect(validateReportConfiguration(unsafe, "2026-11-12").minimumAmount).toContain("smaller");
    const invalid = { ...initialReportConfiguration, mode: "recurring" as const, reportName: "Monthly", selectedAccountIds: ["account-1"], period: { kind: "last-month" as const }, schedule: { ...initialReportConfiguration.schedule, executionDay: "31", executionTime: "00:00", timezone: "UTC", delivery: "unknown" } } as unknown as typeof initialReportConfiguration;
    const errors = validateReportConfiguration(invalid, "2026-11-12");
    expect(errors).toMatchObject({ period: expect.any(String), executionDay: expect.any(String), executionTime: expect.any(String), timezone: expect.any(String), delivery: expect.any(String) });
  });

  it("rejects unsupported core discriminants at the shared validation boundary", () => {
    const invalid = { ...initialReportConfiguration, reportType: "balance-summary", mode: "batch", direction: "sideways", outputFormat: "pdf", period: { kind: "rolling-thirty-days" } } as unknown as typeof initialReportConfiguration;
    expect(validateReportConfiguration(invalid, "2026-11-12")).toMatchObject({ reportType: expect.any(String), mode: expect.any(String), direction: expect.any(String), outputFormat: expect.any(String), period: expect.any(String) });
  });
});
