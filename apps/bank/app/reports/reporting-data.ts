export type ReportStatus = "Active" | "Ready" | "Generating";

export type ReportSummary = {
  id: string;
  name: string;
  type: "Recurring report" | "One-off report";
  scope: string;
  status: ReportStatus;
};

export type ConnectedReportProcess = {
  id: string;
  name: string;
  kind: "Connected data feed" | "Scheduled file delivery";
  cadence: string;
  timing?: string;
  status: "Delivered" | "Scheduled";
};

export const reportSuggestions = [
  "Outgoing payments last month",
  "Monthly account balances",
  "Expenses by team",
] as const;

export const reports: ReportSummary[] = [
  { id: "monthly-transactions", name: "Monthly transaction report", type: "Recurring report", scope: "All GBP accounts", status: "Active" },
  { id: "quarterly-outgoing-payments", name: "Quarterly outgoing payments", type: "One-off report", scope: "1 July to 30 September 2026", status: "Ready" },
  { id: "large-transaction-export", name: "Large transaction export", type: "One-off report", scope: "18 accounts", status: "Generating" },
];

export const connectedReportProcesses: ConnectedReportProcess[] = [
  { id: "daily-account-transactions", name: "Daily account transactions", kind: "Connected data feed", cadence: "Daily delivery", status: "Delivered" },
  { id: "daily-balance-feed", name: "Daily balance feed", kind: "Connected data feed", cadence: "Daily delivery", status: "Delivered" },
  { id: "monthly-reconciliation", name: "Monthly reconciliation", kind: "Scheduled file delivery", cadence: "Monthly delivery", timing: "Next run: 1 December 2026", status: "Scheduled" },
];
