import type { DeepReadonly, FinanceDataset } from "@johnshandux/ledger-synthetic-finance";
import type { ReportConfiguration } from "./configuration";
import { amountInputToMinor, resolveReportPeriod, validateReportConfiguration } from "./configuration";
import { serializeReportCsv } from "./csv";
import { queryTransactionsForReport } from "./query";
import { calendarDateInTimeZone, getNextMonthlyRun } from "./schedule";
import type { GeneratedReportOutput, RecurringReportSchedule, ReportDefinition, ReportRun } from "./types";

export type ReportingOperationDependencies = Readonly<{ now: Date; referenceDate?: string; nextId: (kind: "definition" | "run" | "output" | "schedule") => string }>;

export function generateOneOffReport(dataset: DeepReadonly<FinanceDataset>, configuration: ReportConfiguration, organisationId: string, dependencies: ReportingOperationDependencies, dataOrganisationId = organisationId) {
  if (configuration.mode !== "one-off") throw new Error("A recurring configuration cannot generate a one-off report.");
  assertValid(configuration, dependencies.now, dependencies.referenceDate);
  const createdAt = dependencies.now.toISOString();
  const period = resolveReportPeriod(configuration.period, dependencies.referenceDate ?? calendarDateInTimeZone(dependencies.now));
  const result = queryTransactionsForReport(dataset, toQuery(configuration, dataOrganisationId, period));
  const definitionId = dependencies.nextId("definition");
  const runId = dependencies.nextId("run");
  const outputId = dependencies.nextId("output");
  const name = configuration.reportName.trim() || defaultReportName(period);
  const definition: ReportDefinition = { id: definitionId, name, reportType: configuration.reportType,
    selectedAccountIds: [...configuration.selectedAccountIds], reportingPeriod: period, direction: configuration.direction,
    minimumAmountMinor: amountInputToMinor(configuration.filters.minimumAmount), maximumAmountMinor: amountInputToMinor(configuration.filters.maximumAmount),
    currency: configuration.filters.currency || undefined, outputFormat: "csv", createdAt, organisationId };
  const run: ReportRun = { id: runId, definitionId, executedAt: createdAt, reportingPeriod: period, status: "completed",
    matchingRecordCount: result.rows.length, completedAt: createdAt, outputId };
  const output: GeneratedReportOutput = { id: outputId, runId, filename: `${filenameBase(name)}.csv`, format: "csv",
    recordCount: result.rows.length, createdAt, rows: result.rows.map(row => ({ ...row })), serializedCsv: serializeReportCsv(result.rows) };
  return { definition, run, output, queryResult: result };
}

export function createMonthlySchedule(dataset: DeepReadonly<FinanceDataset>, configuration: ReportConfiguration, organisationId: string, dependencies: ReportingOperationDependencies, dataOrganisationId = organisationId) {
  if (configuration.mode !== "recurring") throw new Error("A one-off configuration cannot create a schedule.");
  assertValid(configuration, dependencies.now, dependencies.referenceDate);
  queryTransactionsForReport(dataset, toQuery(configuration, dataOrganisationId, resolveReportPeriod(configuration.period, dependencies.referenceDate ?? calendarDateInTimeZone(dependencies.now))));
  const createdAt = dependencies.now.toISOString();
  const definition: ReportDefinition = { id: dependencies.nextId("definition"), name: configuration.reportName.trim(), reportType: configuration.reportType,
    selectedAccountIds: [...configuration.selectedAccountIds], reportingPeriod: { rule: "previous-calendar-month" }, direction: configuration.direction,
    minimumAmountMinor: amountInputToMinor(configuration.filters.minimumAmount), maximumAmountMinor: amountInputToMinor(configuration.filters.maximumAmount),
    currency: configuration.filters.currency || undefined, outputFormat: "csv", createdAt, organisationId };
  const schedule: RecurringReportSchedule = { id: dependencies.nextId("schedule"), definitionId: definition.id, frequency: "monthly",
    executionDay: configuration.schedule.executionDay, executionTime: configuration.schedule.executionTime, timezone: configuration.schedule.timezone,
    reportingPeriodRule: "previous-calendar-month", delivery: configuration.schedule.delivery,
    nextScheduledRun: getNextMonthlyRun(dependencies.now, configuration.schedule.executionDay, configuration.schedule.executionTime, configuration.schedule.timezone),
    status: "active", createdAt };
  return { definition, schedule };
}

function assertValid(configuration: ReportConfiguration, now: Date, referenceDate?: string) {
  const errors = validateReportConfiguration(configuration, referenceDate ?? calendarDateInTimeZone(now));
  if (Object.keys(errors).length > 0) throw new Error(`Invalid report configuration: ${Object.values(errors).join(" ")}`);
}
function toQuery(configuration: ReportConfiguration, organisationId: string, period: { from: string; to: string }) {
  return { organisationId, selectedAccountIds: configuration.selectedAccountIds, period, direction: configuration.direction,
    minimumAmountMinor: amountInputToMinor(configuration.filters.minimumAmount), maximumAmountMinor: amountInputToMinor(configuration.filters.maximumAmount),
    currency: configuration.filters.currency || undefined };
}
function defaultReportName(period: { from: string; to: string }) {
  const fromDate = new Date(`${period.from}T00:00:00Z`);
  const toDate = new Date(`${period.to}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });
  const fromMonth = month.format(fromDate);
  const toMonth = month.format(toDate);
  const fromYear = fromDate.getUTCFullYear();
  const toYear = toDate.getUTCFullYear();
  const label = fromMonth === toMonth && fromYear === toYear ? `${fromMonth} ${fromYear}`
    : fromYear === toYear ? `${fromMonth}–${toMonth} ${toYear}`
      : `${fromMonth} ${fromYear}–${toMonth} ${toYear}`;
  return `Transaction activity · ${label}`;
}
function filenameBase(name: string) { return name.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "transaction-activity"; }
