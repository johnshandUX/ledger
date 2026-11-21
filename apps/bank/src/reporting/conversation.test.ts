import { describe, expect, it } from "vitest";
import { BANK_BUSINESS_ID, bankFinanceEnvironment } from "../finance/environment";
import type { ReportConfiguration } from "./configuration";
import { parseReportingIntent, reportingConversationInterpreter, type ReportingConversationContext } from "./conversation";
import { queryTransactionsForReport, type ReportingCoverage } from "./query";
import { amountInputToMinor, resolveReportPeriod } from "./configuration";

const today = "2026-11-20";
const accounts = bankFinanceEnvironment.accounts.filter(account => account.businessId === BANK_BUSINESS_ID).map(account => ({ id: account.id, name: account.name, accountNumber: account.accountNumber, currency: account.currency, status: account.status }));
const completeCoverage: ReportingCoverage = { earliestObservedDate: "2025-11-21", latestObservedDate: today, accountIdsWithHistory: ["history"], accountIdsWithoutHistory: [], observedRangesByAccount: { history: { from: "2025-11-21", to: today } }, startsBeforeObservedRecords: false, endsAfterObservedRecords: false };
const actualCoverage = (configuration: ReportConfiguration) => queryTransactionsForReport(bankFinanceEnvironment, { organisationId: BANK_BUSINESS_ID, selectedAccountIds: configuration.selectedAccountIds, period: resolveReportPeriod(configuration.period, today), direction: configuration.direction, minimumAmountMinor: amountInputToMinor(configuration.filters.minimumAmount), maximumAmountMinor: amountInputToMinor(configuration.filters.maximumAmount), currency: configuration.filters.currency || undefined }).coverage;
const context = (getCoverage: ReportingConversationContext["getCoverage"] = actualCoverage): ReportingConversationContext => ({ activeOrganisationId: BANK_BUSINESS_ID, accounts, today, capabilities: ["transaction-activity", "csv", "monthly-recurring"], getCoverage });
const interpret = (content: string, messages: string[] = [], getCoverage?: ReportingConversationContext["getCoverage"]) => reportingConversationInterpreter.interpret({ id: `turn-${messages.length}`, content, createdAt: "2026-11-20T10:00:00Z" }, { context: context(getCoverage), messages: [...messages, content].map((message, index) => ({ id: `message-${index}`, role: "user" as const, content: message, createdAt: "2026-11-20T10:00:00Z" })), signal: new AbortController().signal, requestId: messages.length + 1 });

describe("deterministic reporting interpretation", () => {
  it("prepares the complete GBP outgoing threshold scenario", async () => {
    const outcome = await interpret("Show me outgoing transactions over £5,000 across all our GBP accounts for the last 12 months.", [], () => completeCoverage);
    expect(outcome.kind).toBe("action");
    if (outcome.kind !== "action" || outcome.action.type !== "report-configuration-prepared") return;
    expect(outcome.action.configuration).toMatchObject({ reportType: "transaction-activity", direction: "outgoing", outputFormat: "csv", filters: { minimumAmount: "5000.01", maximumAmount: "", currency: "GBP" }, period: { kind: "custom", from: "2025-11-21", to: today } });
    expect(outcome.action.configuration.selectedAccountIds).toEqual(accounts.filter(account => account.status !== "closed" && account.currency === "GBP").map(account => account.id));
  });

  it("recognises account names, identifiers, multiple accounts, direction synonyms, ranges and dates", () => {
    const parsed = parseReportingIntent("Account transactions for Main Operating Account and 90000002 from 2026-09-01 to 2026-09-30, money in between £1,000 and £2,500", context());
    expect(parsed.accountIds).toEqual(expect.arrayContaining(["account-main-operating", "account-general-operations"]));
    expect(parsed).toMatchObject({ direction: "incoming", minimumAmount: "1000", maximumAmount: "2500", period: { kind: "custom", from: "2026-09-01", to: "2026-09-30" } });
  });

  it("supports last month, three complete months, this month and strict maximums", () => {
    expect(parseReportingIntent("All GBP account transactions last month", context()).period).toEqual({ kind: "last-month" });
    expect(parseReportingIntent("All GBP account transactions last three complete months", context()).period).toEqual({ kind: "last-three-complete-months" });
    expect(parseReportingIntent("All GBP account transactions this month under £100", context())).toMatchObject({ period: { kind: "custom", from: "2026-11-01", to: today }, maximumAmount: "99.99" });
  });

  it("does not infer direction from account names and rejects conflicting amount currencies", async () => {
    expect(parseReportingIntent("Transactions for UK Customer Receipts last month", context()).direction).toBe("all");
    expect(await interpret("Outgoing transactions over £5,000 for all EUR accounts last month")).toMatchObject({ kind: "error", recoverable: true });
    expect(await interpret("Transactions over £5,000 for USD Operating last month")).toMatchObject({ kind: "error", recoverable: true });
    expect(await interpret("Transactions for Main Operating Account in USD last month")).toMatchObject({ kind: "error", recoverable: true });
    expect(parseReportingIntent("Transactions over 5,000 GBP for all GBP accounts last month", context()).minimumAmount).toBe("5000.01");
    expect(parseReportingIntent("Transactions between 1,000 GBP and 2,000 GBP for all GBP accounts last month", context())).toMatchObject({ minimumAmount: "1000", maximumAmount: "2000" });
    expect(parseReportingIntent("Transactions over 5,000 pounds for all GBP accounts last month", context())).toMatchObject({ minimumAmount: "5000.01", currency: "GBP" });
  });

  it("returns actionable unsupported outcomes instead of misclassifying other report types", async () => {
    for (const request of ["Create a balance summary", "Expenses by team", "Generate an account statement", "Create a payment activity report", "Schedule a weekly transaction report"]) {
      expect((await interpret(request)).kind).toBe("unsupported");
    }
  });

  it("returns a recoverable error for inconsistent amount boundaries and unsupported input", async () => {
    expect(await interpret("Transaction report between £5,000 and £1,000 for all GBP accounts last month")).toMatchObject({ kind: "error", recoverable: true });
    expect((await interpret("Tell me something interesting")).kind).toBe("unsupported");
  });

  it("prepares only the supported previous-month rule for monthly recurrence", async () => {
    const recurring = await interpret("Create a monthly recurring transaction report for Main Operating Account", [], () => completeCoverage);
    expect(recurring.kind).toBe("action");
    if (recurring.kind === "action") expect(recurring.action.configuration).toMatchObject({ mode: "recurring", period: { kind: "previous-calendar-month" }, reportName: "Monthly transaction report" });
    expect((await interpret("Create a monthly recurring transaction report for Main Operating Account for the last 12 months")).kind).toBe("unsupported");
  });
});

describe("reporting clarification continuity", () => {
  it("asks for grounded operating account selection, then retains it while asking for a period", async () => {
    const first = await interpret("Create a report for our operating accounts.");
    expect(first).toMatchObject({ kind: "clarification", clarification: { message: "Which accounts would you like to include?" } });
    if (first.kind !== "clarification") return;
    expect(first.clarification.choices.some(choice => choice.label.includes("matching accounts"))).toBe(true);
    const second = await interpret("Use all matching accounts", ["Create a report for our operating accounts."]);
    expect(second).toMatchObject({ kind: "clarification", clarification: { message: "Which reporting period would you like?" } });
    const final = await interpret("Last month", ["Create a report for our operating accounts.", "Use all matching accounts"], () => completeCoverage);
    expect(final.kind).toBe("action");
    if (final.kind === "action") expect(final.action.configuration.selectedAccountIds.length).toBeGreaterThan(1);
  });

  it("preserves currency selection through a period follow-up", async () => {
    const first = await interpret("Create a transaction report for our GBP accounts");
    expect(first.kind).toBe("clarification");
    const final = await interpret("Last month", ["Create a transaction report for our GBP accounts"], () => completeCoverage);
    expect(final.kind).toBe("action");
    if (final.kind === "action") expect(final.action.configuration.filters.currency).toBe("GBP");
  });

  it("offers a recoverable manual path for unresolved account selection", async () => {
    const outcome = await interpret("Specify accounts in the creation workspace", ["Create a transaction report last month"]);
    expect(outcome).toMatchObject({ kind: "action", action: { type: "manual-report-configuration", configuration: { selectedAccountIds: [] } } });
  });

  it("preserves monthly recurrence when account selection moves to the workspace", async () => {
    const outcome = await interpret("Specify accounts in the creation workspace", ["Create a monthly recurring transaction report"]);
    expect(outcome).toMatchObject({ kind: "action", action: { type: "manual-report-configuration", configuration: { mode: "recurring", reportName: "Monthly transaction report", period: { kind: "previous-calendar-month" }, selectedAccountIds: [] } } });
  });
});

describe("observed historical coverage", () => {
  const request = "Create a transaction report for all our GBP accounts covering the last two years.";
  it("calculates the earliest actual record and preserves differing account coverage", async () => {
    const outcome = await interpret(request);
    expect(outcome.kind).toBe("clarification");
    if (outcome.kind !== "clarification") return;
    const expected = actualCoverage(parseConfigurationForCoverage());
    expect(outcome.clarification.message).toContain(formatDate(expected.earliestObservedDate!));
    expect(outcome.clarification.message).toContain(formatDate(expected.latestObservedDate!));
    expect(outcome.clarification.message).toContain("Observed start dates differ");
    expect(outcome.clarification.message).toContain("no observed transaction history");
  });

  it("keeps requested dates only after the customer chooses to", async () => {
    const outcome = await interpret("Keep requested dates", [request]);
    expect(outcome.kind).toBe("action");
    if (outcome.kind === "action") expect(outcome.action.configuration.period).toEqual({ kind: "custom", from: "2024-11-21", to: today });
  });

  it("adjusts to the calculated earliest date only after explicit acceptance", async () => {
    const original = await interpret(request);
    if (original.kind !== "clarification") throw new Error("Expected coverage clarification");
    const expectedDate = actualCoverage(parseConfigurationForCoverage()).earliestObservedDate;
    const adjusted = await interpret("Use available dates", [request]);
    expect(adjusted.kind).toBe("action");
    if (adjusted.kind === "action") expect(adjusted.action.configuration.period).toEqual({ kind: "custom", from: expectedDate, to: actualCoverage(parseConfigurationForCoverage()).latestObservedDate });
  });

  it("requires a new period after the customer chooses to change it", async () => {
    const outcome = await interpret("Change reporting period", [request]);
    expect(outcome).toMatchObject({ kind: "action", action: { type: "manual-report-configuration", unresolved: "period", configuration: { period: { kind: "custom", from: "", to: "" } } } });
  });
});

function parseConfigurationForCoverage(): ReportConfiguration { const intent = parseReportingIntent(requestText(), context()); return { reportType: "transaction-activity", reportName: "", selectedAccountIds: intent.accountIds!, period: intent.period!, direction: intent.direction, filters: { minimumAmount: "", maximumAmount: "", currency: intent.currency ?? "" }, outputFormat: "csv", mode: "one-off", schedule: { frequency: "monthly", executionDay: "1", executionTime: "06:00", timezone: "Europe/London", delivery: "my-reports" } }; }
function requestText() { return "Create a transaction report for all our GBP accounts covering the last two years."; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
