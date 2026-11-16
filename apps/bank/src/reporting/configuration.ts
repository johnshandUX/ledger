export type ReportPeriod =
  | { kind: "last-month" }
  | { kind: "last-three-complete-months" }
  | { kind: "custom"; from: string; to: string }
  | { kind: "previous-calendar-month" };

export type ReportConfiguration = {
  reportType: "transaction-activity";
  reportName: string;
  selectedAccountIds: readonly string[];
  period: ReportPeriod;
  direction: "all" | "incoming" | "outgoing";
  filters: { minimumAmount: string; maximumAmount: string; currency: string };
  outputFormat: "csv";
  mode: "one-off" | "recurring";
  schedule: {
    frequency: "monthly";
    executionDay: "1" | "5" | "15" | "last";
    executionTime: "06:00" | "09:00" | "18:00";
    timezone: "Europe/London";
    delivery: "my-reports" | "caldermere-finance-erp";
  };
};

export const initialReportConfiguration: ReportConfiguration = {
  reportType: "transaction-activity",
  reportName: "",
  selectedAccountIds: [],
  period: { kind: "last-month" },
  direction: "all",
  filters: { minimumAmount: "", maximumAmount: "", currency: "" },
  outputFormat: "csv",
  mode: "one-off",
  schedule: {
    frequency: "monthly",
    executionDay: "1",
    executionTime: "06:00",
    timezone: "Europe/London",
    delivery: "my-reports",
  },
};

export function validateReportConfiguration(configuration: ReportConfiguration, today: string) {
  const errors: Record<string, string> = {};
  if (configuration.reportType !== "transaction-activity") errors.reportType = "Choose the supported Transaction activity report type.";
  if (!["one-off", "recurring"].includes(configuration.mode)) errors.mode = "Choose one-off or recurring reporting.";
  if (!["all", "incoming", "outgoing"].includes(configuration.direction)) errors.direction = "Choose a valid transaction direction.";
  if (configuration.outputFormat !== "csv") errors.outputFormat = "Choose the supported CSV output format.";
  if (!["last-month", "last-three-complete-months", "custom", "previous-calendar-month"].includes(configuration.period.kind)) errors.period = "Choose a valid reporting period.";
  if (configuration.selectedAccountIds.length === 0) errors.accounts = "Select at least one account.";
  if (configuration.mode === "recurring" && !configuration.reportName.trim()) errors.reportName = "Enter a report name for this recurring report.";
  if (configuration.mode === "recurring" && configuration.period.kind !== "previous-calendar-month") errors.period = "Recurring reports must cover the previous calendar month.";
  if (configuration.mode === "recurring" && configuration.schedule.frequency !== "monthly") errors.frequency = "Choose the supported monthly frequency.";
  if (configuration.mode === "recurring" && !["1", "5", "15", "last"].includes(configuration.schedule.executionDay)) errors.executionDay = "Choose a valid execution day.";
  if (configuration.mode === "recurring" && !["06:00", "09:00", "18:00"].includes(configuration.schedule.executionTime)) errors.executionTime = "Choose a valid execution time.";
  if (configuration.mode === "recurring" && configuration.schedule.timezone !== "Europe/London") errors.timezone = "The supported timezone is Europe/London.";
  if (configuration.mode === "recurring" && !["my-reports", "caldermere-finance-erp"].includes(configuration.schedule.delivery)) errors.delivery = "Choose a valid delivery destination.";
  if (configuration.period.kind === "custom") {
    if (!configuration.period.from) errors.from = "Enter a From date.";
    if (!configuration.period.to) errors.to = "Enter a To date.";
    if (configuration.period.from && !isCalendarDate(configuration.period.from)) errors.from = "Enter a valid From date.";
    if (configuration.period.to && !isCalendarDate(configuration.period.to)) errors.to = "Enter a valid To date.";
    if (!errors.from && !errors.to && configuration.period.from > configuration.period.to) errors.to = "The To date must be on or after the From date.";
    if (!errors.from && configuration.period.from > today) errors.from = "The From date cannot be in the future.";
    if (!errors.to && configuration.period.to > today) errors.to = "The To date cannot be in the future.";
  }
  const validAmount = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value);
  const minimum = configuration.filters.minimumAmount === "" ? undefined : Number(configuration.filters.minimumAmount);
  const maximum = configuration.filters.maximumAmount === "" ? undefined : Number(configuration.filters.maximumAmount);
  if (minimum !== undefined && (!validAmount(configuration.filters.minimumAmount) || !Number.isFinite(minimum) || minimum < 0)) errors.minimumAmount = "Enter a minimum amount of zero or more, with up to two decimal places.";
  if (maximum !== undefined && (!validAmount(configuration.filters.maximumAmount) || !Number.isFinite(maximum) || maximum < 0)) errors.maximumAmount = "Enter a maximum amount of zero or more, with up to two decimal places.";
  if (minimum !== undefined && validAmount(configuration.filters.minimumAmount) && !Number.isSafeInteger(amountInputToMinor(configuration.filters.minimumAmount))) errors.minimumAmount = "Enter a smaller minimum amount.";
  if (maximum !== undefined && validAmount(configuration.filters.maximumAmount) && !Number.isSafeInteger(amountInputToMinor(configuration.filters.maximumAmount))) errors.maximumAmount = "Enter a smaller maximum amount.";
  if (minimum !== undefined && maximum !== undefined && Number.isFinite(minimum) && Number.isFinite(maximum) && minimum > maximum) errors.maximumAmount = "The maximum amount must be at least the minimum amount.";
  return errors;
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function scheduleSummary(configuration: ReportConfiguration) {
  const days = { "1": "1st", "5": "5th", "15": "15th", last: "last day" } as const;
  return `Runs on the ${days[configuration.schedule.executionDay]} of every month at ${configuration.schedule.executionTime} (${configuration.schedule.timezone}), covering the previous calendar month.`;
}

export function resolveReportPeriod(period: ReportPeriod, today: string) {
  if (period.kind === "custom") return { from: period.from, to: period.to };
  if (!["last-month", "last-three-complete-months", "previous-calendar-month"].includes(period.kind)) throw new Error("Unsupported reporting period.");
  const current = new Date(`${today}T12:00:00Z`);
  const end = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 0));
  const monthsBack = period.kind === "last-three-complete-months" ? 3 : 1;
  const start = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - monthsBack, 1));
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

export function amountInputToMinor(value: string): number | undefined {
  if (value === "") return undefined;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return undefined;
  const minor = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(minor) ? minor : undefined;
}
