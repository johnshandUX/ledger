import type { ConversationInterpreter, ConversationMessage, ConversationOutcome, StructuredConversationAction } from "@johnshandux/ledger-design-system/conversation";
import type { ReportConfiguration, ReportPeriod } from "./configuration";
import { initialReportConfiguration, resolveReportPeriod, validateReportConfiguration } from "./configuration";
import type { ReportingCoverage } from "./query";

export type ReportingConversationAccount = Readonly<{ id: string; name: string; accountNumber?: string; currency: string; status: string }>;
export type ReportingConversationContext = Readonly<{
  activeOrganisationId: string;
  accounts: readonly ReportingConversationAccount[];
  today: string;
  capabilities: readonly string[];
  getCoverage: (configuration: ReportConfiguration) => ReportingCoverage;
}>;
export type ReportingConversationAction = StructuredConversationAction & (
  | Readonly<{ type: "report-configuration-prepared"; configuration: ReportConfiguration; coverage: ReportingCoverage }>
  | Readonly<{ type: "manual-report-configuration"; configuration: ReportConfiguration; reason: string; unresolved: "accounts" | "period" }>
);
export type ReportingConversationInterpreter = ConversationInterpreter<ReportingConversationContext, ReportingConversationAction>;

type ParsedIntent = { accountIds?: readonly string[]; accountAmbiguity?: readonly ReportingConversationAccount[]; currency?: string; period?: ReportPeriod; direction: ReportConfiguration["direction"]; minimumAmount?: string; maximumAmount?: string; mode: ReportConfiguration["mode"]; unsupported?: string; error?: string };
const currencyTerms: Readonly<Record<string, readonly string[]>> = { GBP: ["gbp", "sterling", "pound", "pounds", "£"], USD: ["usd", "us dollar", "us dollars", "$"], EUR: ["eur", "euro", "euros", "€"] };

export const reportingConversationInterpreter: ReportingConversationInterpreter = {
  async interpret(request, { context, messages, signal }) {
    if (signal.aborted) return { kind: "error", message: "The request was cancelled.", recoverable: true };
    const userText = userConversationText(messages, request.content);
    const intent = parseReportingIntent(userText, context);
    if (intent.unsupported) return { kind: "unsupported", message: intent.unsupported };
    if (intent.error) return { kind: "error", message: intent.error, recoverable: true };
    if (intent.currency && !context.accounts.some(account => account.status !== "closed" && account.currency === intent.currency)) return { kind: "error", message: `No accessible eligible ${intent.currency} accounts are available for reporting. Choose another currency or select accounts manually.`, recoverable: true };
    if (intent.mode === "recurring" && intent.period && !["last-month", "previous-calendar-month"].includes(intent.period.kind)) return { kind: "unsupported", message: "Monthly recurring reports must cover the previous calendar month. Continue with a one-off report for the requested period, or revise the request." };
    if (/\bspecify accounts in the creation workspace\b/.test(normalize(userText))) return manualConfiguration(intent, "Select the accounts in the creation workspace.", "accounts");
    if (intent.accountAmbiguity) return accountClarification(intent.accountAmbiguity, request.id);
    if (!intent.accountIds?.length) return missingAccountClarification(context.accounts, request.id);
    if (!intent.period && intent.mode !== "recurring") return periodClarification(request.id);
    const configuration = configurationFromIntent(intent);
    const validation = validateReportConfiguration(configuration, context.today);
    if (Object.keys(validation).length > 0) return { kind: "error", message: `I could not prepare a valid report configuration. ${Object.values(validation)[0]}`, recoverable: true };
    const coverage = context.getCoverage(configuration);
    const coverageDecision = parseCoverageDecision(normalize(userText));
    if (coverage.accountIdsWithHistory.length === 0) return { kind: "action", action: { type: "report-configuration-prepared", configuration, coverage }, message: "I prepared the configuration. The selected accounts have no observed transaction history, so the CSV may contain only headers." };
    if ((coverage.startsBeforeObservedRecords || coverage.endsAfterObservedRecords) && !coverageDecision) return coverageClarification(coverage, request.id);
    if (coverageDecision === "available" && coverage.earliestObservedDate && coverage.latestObservedDate) {
      const requested = resolveReportPeriod(configuration.period, context.today);
      const adjusted = { ...configuration, period: { kind: "custom", from: coverage.startsBeforeObservedRecords ? coverage.earliestObservedDate : requested.from, to: coverage.endsAfterObservedRecords ? coverage.latestObservedDate : requested.to } } satisfies ReportConfiguration;
      return prepared(adjusted, context.getCoverage(adjusted), context.accounts, "I adjusted the reporting period to the observed record dates. Review the configuration before generating the report.");
    }
    if (coverageDecision === "change") return { kind: "action", action: { type: "manual-report-configuration", configuration: { ...configuration, period: { kind: "custom", from: "", to: "" } }, reason: "Choose a different reporting period in the creation workspace.", unresolved: "period" }, message: "Continue in the creation workspace to choose a different reporting period." };
    return prepared(configuration, coverage, context.accounts, coverageDecision === "keep" ? "I kept the requested dates. Records will only appear where observed data exists." : undefined);
  },
};

export function parseReportingIntent(text: string, context: Pick<ReportingConversationContext, "accounts" | "today">): ParsedIntent {
  const normalized = normalize(text);
  const unsupported = unsupportedRequest(normalized);
  if (unsupported) return { direction: "all", mode: "one-off", unsupported };
  const currencyResult = parseCurrency(normalized);
  const currency = currencyResult.currency;
  const accounts = parseAccounts(normalized, context.accounts, currency);
  if (currencyResult.error) return { ...accounts, currency, direction: "all", mode: "one-off", error: currencyResult.error };
  if (currency && accounts.accountIds?.length) {
    const selectedCurrencies = [...new Set(context.accounts.filter(account => accounts.accountIds!.includes(account.id)).map(account => account.currency))];
    if (!selectedCurrencies.includes(currency)) return { ...accounts, currency, direction: "all", mode: "one-off", error: "The requested currency does not match the selected accounts. Ledger does not convert currencies; revise the accounts or currency." };
  }
  if (currencyResult.amountCurrency && accounts.accountIds?.length) {
    const selectedCurrencies = [...new Set(context.accounts.filter(account => accounts.accountIds!.includes(account.id)).map(account => account.currency))];
    if (selectedCurrencies.length !== 1 || selectedCurrencies[0] !== currencyResult.amountCurrency) return { ...accounts, currency, direction: "all", mode: "one-off", error: "The amount currency does not match the selected account currency. Ledger does not convert currencies; revise the accounts or amount currency." };
  }
  const amounts = parseAmounts(normalized);
  if (amounts.error) return { direction: "all", mode: "one-off", error: amounts.error };
  return { ...accounts, currency, period: parsePeriod(normalized, context.today), direction: parseDirection(normalized), minimumAmount: amounts.minimum, maximumAmount: amounts.maximum, mode: /\b(monthly|every month|recurring)\b/.test(normalized) ? "recurring" : "one-off" };
}

function userConversationText(messages: readonly ConversationMessage[], current: string) { const contents = messages.filter(message => message.role === "user").map(message => message.content); if (contents.at(-1) !== current) contents.push(current); return contents.join("\n"); }
function unsupportedRequest(text: string) {
  if (/\b(balance|balances|balance summary)\b/.test(text)) return "Assisted creation currently supports transaction activity reports, not balance summaries. You can use manual Create report for the available transaction report.";
  if (/\b(expense|expenses|spend by team|card activity)\b/.test(text)) return "Expense reporting is not currently supported by assisted creation. You can prepare a transaction activity report instead.";
  if (/\b(statement|bank statement|account statement)\b/.test(text)) return "Formal account statements are not available through assisted report creation.";
  if (/\b(payment activity|payments report|payment report)\b/.test(text)) return "Payment activity reports are not currently supported. Assisted creation can prepare transaction activity reports.";
  if (/\b(weekly|daily|quarterly|yearly|annually)\b.*\b(recurring|schedule|scheduled|every)\b|\b(schedule|scheduled|recurring)\b.*\b(weekly|daily|quarterly|yearly|annually)\b|\bevery (week|day|quarter|year)\b/.test(text)) return "Assisted scheduling currently supports monthly recurring transaction reports only.";
  if (!/\b(transaction|transactions|activity|report|csv|account|accounts)\b/.test(text)) return "I could not identify a supported transaction reporting request. Try asking for account transactions and include the accounts and reporting period.";
}
function parseCurrency(text: string): { currency?: string; amountCurrency?: string; error?: string } {
  const scoped = Object.entries(currencyTerms).find(([, terms]) => terms.some(term => new RegExp(`(?:all|our|the|in|currency)?\\s*${escapeRegExp(term)}\\s+accounts?\\b|\\b(?:in|currency)\\s+${escapeRegExp(term)}\\b`).test(text)))?.[0];
  const amountCurrencies = Object.entries(currencyTerms).filter(([, terms]) => terms.some(term => new RegExp(`${escapeRegExp(term)}\\s*[0-9]|[0-9][0-9,.]*\\s*${escapeRegExp(term)}\\b`).test(text))).map(([currency]) => currency);
  const amountCurrency = [...new Set(amountCurrencies)][0];
  if (new Set(amountCurrencies).size > 1 || (scoped && amountCurrency && scoped !== amountCurrency)) return { currency: scoped, amountCurrency, error: "The request contains conflicting currencies. Ledger does not convert amounts; use one account and amount currency." };
  return { currency: scoped ?? amountCurrency, amountCurrency };
}
function parseAccounts(text: string, accounts: readonly ReportingConversationAccount[], currency?: string): Pick<ParsedIntent, "accountIds" | "accountAmbiguity"> {
  const eligible = accounts.filter(account => account.status !== "closed");
  const explicitIds = eligible.filter(account => [account.id, account.accountNumber].filter(Boolean).some(value => text.includes(normalize(value!))));
  const exactNames = eligible.filter(account => text.includes(normalize(account.name)));
  const explicitlyMatched = [...new Map([...explicitIds, ...exactNames].map(account => [account.id, account])).values()];
  if (explicitlyMatched.length) return { accountIds: explicitlyMatched.map(account => account.id) };
  if (/\ball (?:our |the )?(?:eligible )?(?:gbp|sterling|pound|pounds|usd|us dollar|eur|euro)?\s*accounts\b|\b(?:our |the )?(?:gbp|sterling|pound|pounds|usd|us dollar|eur|euro) accounts\b/.test(text)) return { accountIds: eligible.filter(account => !currency || account.currency === currency).map(account => account.id) };
  const groupTerm = ["operating", "operations", "receipts", "payments", "reserve", "payroll"].find(term => text.includes(`${term} account`) || text.includes(`${term} accounts`));
  if (groupTerm) {
    const matches = eligible.filter(account => normalize(account.name).includes(groupTerm === "operating" ? "operat" : groupTerm) && (!currency || account.currency === currency));
    if (matches.length === 1) return { accountIds: [matches[0]!.id] };
    if (matches.length > 1) { if (text.includes(`all ${groupTerm}`) || text.includes(`all our ${groupTerm}`) || text.includes("use all matching accounts")) return { accountIds: matches.map(account => account.id) }; return { accountAmbiguity: matches }; }
  }
  const selectedChoice = eligible.find(account => text.includes(normalize(account.name)));
  return selectedChoice ? { accountIds: [selectedChoice.id] } : {};
}
function parsePeriod(text: string, today: string): ReportPeriod | undefined {
  if (/\b(previous calendar month|last month)\b/.test(text)) return { kind: "last-month" };
  if (/\blast (?:three|3) complete months\b/.test(text)) return { kind: "last-three-complete-months" };
  if (/\bthis month\b/.test(text)) return { kind: "custom", from: `${today.slice(0, 7)}-01`, to: today };
  const rolling = /\blast (12|twelve|24|twenty[- ]four|2|two) months?\b|\blast (2|two) years?\b/.exec(text);
  if (rolling) { const months = /(?:24|twenty[- ]four) months|(?:2|two) years/.test(rolling[0]) ? 24 : 12; return { kind: "custom", from: shiftMonthsInclusive(today, -months), to: today }; }
  const isoRange = /\b(\d{4}-\d{2}-\d{2})\s+(?:to|through|until)\s+(\d{4}-\d{2}-\d{2})\b/.exec(text);
  if (isoRange) return { kind: "custom", from: isoRange[1]!, to: isoRange[2]! };
}
function shiftMonthsInclusive(today: string, delta: number) { const date = new Date(`${today}T12:00:00Z`); const originalDay = date.getUTCDate(); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + delta); date.setUTCDate(Math.min(originalDay, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate())); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0, 10); }
function parseDirection(text: string): ReportConfiguration["direction"] { if (/\b(outgoing|money out|debits?|paid|sent)\b/.test(text)) return "outgoing"; if (/\b(incoming|money in|credits?|received|incoming receipts)\b/.test(text)) return "incoming"; return "all"; }
function parseAmounts(text: string): { minimum?: string; maximum?: string; error?: string } {
  const currencyToken = "(?:£|\\$|€|GBP|USD|EUR|sterling|pounds?|euros?|US dollars?)";
  const amount = `(?:${currencyToken}\\s*)?([0-9][0-9,]*(?:\\.[0-9]{1,2})?)(?:\\s*${currencyToken})?`;
  const between = new RegExp(`\\bbetween\\s+${amount}\\s+(?:and|to)\\s+${amount}`, "i").exec(text);
  if (between) { const minimum = cleanAmount(between[1]!); const maximum = cleanAmount(between[2]!); if (Number(minimum) > Number(maximum)) return { error: "The lower amount must not exceed the upper amount. Please revise the amount range." }; return { minimum, maximum }; }
  const greater = new RegExp(`\\b(over|greater than|more than|above|at least|minimum(?: of)?)\\s+${amount}`, "i").exec(text);
  const less = new RegExp(`\\b(under|less than|below|at most|maximum(?: of)?)\\s+${amount}`, "i").exec(text);
  const result: { minimum?: string; maximum?: string } = {};
  if (greater) result.minimum = adjustStrict(cleanAmount(greater[2]!), ["over", "greater than", "more than", "above"].includes(greater[1]!.toLowerCase()), 1);
  if (less) result.maximum = adjustStrict(cleanAmount(less[2]!), ["under", "less than", "below"].includes(less[1]!.toLowerCase()), -1);
  return result;
}
function cleanAmount(value: string) { const numeric = value.replaceAll(",", ""); return Number(numeric).toFixed(numeric.includes(".") ? Math.min(numeric.split(".")[1]!.length, 2) : 0); }
function adjustStrict(value: string, strict: boolean, cents: 1 | -1) { if (!strict) return value; const minor = Math.round(Number(value) * 100) + cents; return `${Math.floor(minor / 100)}.${String(Math.abs(minor) % 100).padStart(2, "0")}`; }
function configurationFromIntent(intent: ParsedIntent): ReportConfiguration { const recurring = intent.mode === "recurring"; return { ...initialReportConfiguration, reportName: recurring ? "Monthly transaction report" : "", selectedAccountIds: intent.accountIds ?? [], period: recurring ? { kind: "previous-calendar-month" } : intent.period!, direction: intent.direction, filters: { minimumAmount: intent.minimumAmount ?? "", maximumAmount: intent.maximumAmount ?? "", currency: intent.currency ?? "" }, mode: intent.mode }; }
function manualConfiguration(intent: ParsedIntent, reason: string, unresolved: "accounts" | "period"): ConversationOutcome<ReportingConversationAction> { const recurring = intent.mode === "recurring"; const configuration: ReportConfiguration = { ...initialReportConfiguration, reportName: recurring ? "Monthly transaction report" : "", selectedAccountIds: intent.accountIds ?? [], period: recurring ? { kind: "previous-calendar-month" } : intent.period ?? initialReportConfiguration.period, direction: intent.direction, filters: { minimumAmount: intent.minimumAmount ?? "", maximumAmount: intent.maximumAmount ?? "", currency: intent.currency ?? "" }, mode: intent.mode }; return { kind: "action", action: { type: "manual-report-configuration", configuration, reason, unresolved }, message: reason }; }
function parseCoverageDecision(text: string): "available" | "keep" | "change" | undefined { if (/\b(use available dates|start from (?:the )?(?:earliest|available)|adjust.*available)\b/.test(text)) return "available"; if (/\b(keep requested dates|keep (?:the )?original dates|do not change|don't change)\b/.test(text)) return "keep"; if (/\b(change reporting period|choose.*period.*workspace)\b/.test(text)) return "change"; }
function accountClarification(accounts: readonly ReportingConversationAccount[], turnId: string): ConversationOutcome<ReportingConversationAction> { return { kind: "clarification", clarification: { id: `accounts-${turnId}`, turnId, message: "Which accounts would you like to include?", choices: [{ id: "all-matching", label: `Use all ${accounts.length} matching accounts` }, ...accounts.slice(0, 5).map(account => ({ id: account.id, label: account.name, description: `${account.accountNumber ?? account.id} · ${account.currency}` })), { id: "manual-accounts", label: "Specify accounts in the creation workspace" }] } }; }
function missingAccountClarification(accounts: readonly ReportingConversationAccount[], turnId: string): ConversationOutcome<ReportingConversationAction> { const currencies = [...new Set(accounts.filter(account => account.status !== "closed").map(account => account.currency))].sort(); return { kind: "clarification", clarification: { id: `accounts-${turnId}`, turnId, message: "Which accounts would you like to include?", choices: [...currencies.map(currency => ({ id: `all-${currency}`, label: `All eligible ${currency} accounts` })), { id: "manual-accounts", label: "Specify accounts in the creation workspace" }] } }; }
function periodClarification(turnId: string): ConversationOutcome<ReportingConversationAction> { return { kind: "clarification", clarification: { id: `period-${turnId}`, turnId, message: "Which reporting period would you like?", choices: [{ id: "last-month", label: "Last month" }, { id: "last-three", label: "Last three complete months" }] } }; }
function coverageClarification(coverage: ReportingCoverage, turnId: string): ConversationOutcome<ReportingConversationAction> { const withoutHistory = coverage.accountIdsWithoutHistory.length; const differingStarts = new Set(Object.values(coverage.observedRangesByAccount).map(range => range.from)).size > 1; const range = coverage.startsBeforeObservedRecords && coverage.endsAfterObservedRecords ? `Observed records range from ${formatDate(coverage.earliestObservedDate!)} to ${formatDate(coverage.latestObservedDate!)}.` : coverage.startsBeforeObservedRecords ? `The earliest observed transaction record is ${formatDate(coverage.earliestObservedDate!)}.` : `The latest observed transaction record is ${formatDate(coverage.latestObservedDate!)}.`; const detail = `${differingStarts ? " Observed start dates differ across the selected accounts." : ""}${withoutHistory ? ` ${withoutHistory} selected ${withoutHistory === 1 ? "account has" : "accounts have"} no observed transaction history.` : ""}`; return { kind: "clarification", clarification: { id: `coverage-${turnId}`, turnId, message: `I can prepare that report, but it extends beyond the observed records for the selected accounts. ${range} This does not establish complete history.${detail} Would you like to adjust to the observed dates?`, choices: [{ id: "available", label: "Use available dates" }, { id: "keep", label: "Keep requested dates" }, { id: "change", label: "Change reporting period" }] } }; }
function prepared(configuration: ReportConfiguration, coverage: ReportingCoverage, accounts: readonly ReportingConversationAccount[], message?: string): ConversationOutcome<ReportingConversationAction> { const count = configuration.selectedAccountIds.length; const names = accounts.filter(account => configuration.selectedAccountIds.includes(account.id)).map(account => account.name); return { kind: "action", action: { type: "report-configuration-prepared", configuration, coverage }, message: message ?? `I prepared a transaction activity report for ${count === 1 ? names[0] : `${count} accounts`}. Review the configuration before generating the report.` }; }
function normalize(value: string) { return value.toLocaleLowerCase("en-GB").replace(/[’]/g, "'").replace(/\s+/g, " ").trim(); }
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
