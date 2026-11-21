import type { TransactionDirection } from "@johnshandux/ledger-synthetic-finance";
import type { ReportConfiguration } from "./configuration";

export type ReportingDateRange = Readonly<{ from: string; to: string }>;
export type ReportingDirection = "all" | "incoming" | "outgoing";
export type ReportingDelivery = "my-reports" | "caldermere-finance-erp";

export type ReportDefinition = Readonly<{
  id: string; name: string; reportType: "transaction-activity"; selectedAccountIds: readonly string[];
  reportingPeriod: ReportingDateRange | Readonly<{ rule: "previous-calendar-month" }>;
  direction: ReportingDirection; minimumAmountMinor?: number; maximumAmountMinor?: number; currency?: string;
  outputFormat: "csv"; createdAt: string; organisationId: string;
}>;

export type ReportRun = Readonly<{
  id: string; definitionId: string; executedAt: string; reportingPeriod: ReportingDateRange;
  status: "completed"; matchingRecordCount: number; completedAt: string; outputId: string;
}>;

export type ReportOutputRow = Readonly<{
  transactionId: string; transactionDate: string; bookedAt: string; accountId: string; accountName: string;
  accountIdentifier: string; currency: string; description: string; counterparty?: string;
  paymentReference?: string; direction: TransactionDirection; amountMinor: number;
}>;

export type GeneratedReportOutput = Readonly<{
  id: string; runId: string; filename: string; format: "csv"; recordCount: number; createdAt: string;
  rows: readonly ReportOutputRow[]; serializedCsv: string;
}>;

export type RecurringReportSchedule = Readonly<{
  id: string; definitionId: string; frequency: "monthly"; executionDay: "1" | "5" | "15" | "last";
  executionTime: "06:00" | "09:00" | "18:00"; timezone: "Europe/London";
  reportingPeriodRule: "previous-calendar-month"; delivery: ReportingDelivery; nextScheduledRun: string;
  status: "active"; createdAt: string;
}>;

export type ReportingState = Readonly<{
  definitions: readonly ReportDefinition[]; runs: readonly ReportRun[]; outputs: readonly GeneratedReportOutput[];
  schedules: readonly RecurringReportSchedule[]; latestCreatedScheduleId?: string;
  assistedConfiguration?: ReportConfiguration;
}>;

export const initialReportingState: ReportingState = { definitions: [], runs: [], outputs: [], schedules: [] };
