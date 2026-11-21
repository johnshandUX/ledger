"use client";

import { Button } from "@johnshandux/ledger-design-system";
import { ConversationAction, ConversationClarificationControls, ConversationInput, ConversationMessages, useConversation } from "@johnshandux/ledger-design-system/conversation";
import { Icon } from "@johnshandux/ledger-design-system/icons";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBankOrganisationAccess } from "../../src/finance/organisations";
import { amountInputToMinor, resolveReportPeriod, type ReportConfiguration } from "../../src/reporting/configuration";
import { reportingConversationInterpreter, type ReportingConversationAction, type ReportingConversationContext } from "../../src/reporting/conversation";
import { queryTransactionsForReport } from "../../src/reporting/query";
import { calendarDateInTimeZone } from "../../src/reporting/schedule";
import { useBankOrganisation } from "../BankOrganisationProvider";
import { useBankState } from "../BankStateProvider";
import { useReportingDispatch } from "../ReportingStateProvider";
import { useEffectiveAccounts } from "../useBankEffectiveState";
import { reportSuggestions } from "./reporting-data";

export function ReportRequestInput({ today }: Readonly<{ today?: string }>) {
  const router = useRouter();
  const { baseline } = useBankState();
  const effectiveAccounts = useEffectiveAccounts();
  const { activeOrganisationId, activeMembership } = useBankOrganisation();
  const reportingDispatch = useReportingDispatch();
  const [request, setRequest] = useState("");
  const [runtimeToday, setRuntimeToday] = useState(today ?? "");
  const responseRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (today) return; const timer = window.setTimeout(() => setRuntimeToday(calendarDateInTimeZone(new Date())), 0); return () => window.clearTimeout(timer); }, [today]);
  const dataOrganisationId = getBankOrganisationAccess(activeOrganisationId, activeMembership.userId)!.financialDataSourceBusinessId;
  const dataset = useMemo(() => ({ ...baseline, accounts: effectiveAccounts }), [baseline, effectiveAccounts]);
  const context = useMemo<ReportingConversationContext>(() => ({
    activeOrganisationId,
    accounts: effectiveAccounts.filter(account => account.businessId === dataOrganisationId).map(account => ({ id: account.id, name: account.name, accountNumber: account.accountNumber, currency: account.currency, status: account.status })),
    today: runtimeToday,
    capabilities: ["transaction-activity", "csv", "monthly-recurring"],
    getCoverage: configuration => queryTransactionsForReport(dataset, queryFromConfiguration(configuration, dataOrganisationId, runtimeToday)).coverage,
  }), [activeOrganisationId, dataOrganisationId, dataset, effectiveAccounts, runtimeToday]);
  const conversation = useConversation<ReportingConversationContext, ReportingConversationAction>({ interpreter: reportingConversationInterpreter, context });
  useEffect(() => { if (["clarification-required", "ready-for-action", "error"].includes(conversation.state.status)) responseRef.current?.focus(); }, [conversation.state.status]);

  const submit = async (value: string) => { setRequest(""); await conversation.submit(value); };
  const clarification = conversation.state.clarification;
  const outcome = conversation.state.outcome;
  const action = outcome?.kind === "action" ? outcome.action : undefined;
  const review = () => { if (!action) return; reportingDispatch({ type: "assisted-configuration-prepared", configuration: action.configuration }); router.push("/reports/new"); };
  const confirmClarification = () => {
    const selected = clarification?.choices.find(choice => choice.id === clarification.selectedChoiceId);
    if (selected) void submit(selected.id === "all-matching" ? "Use all matching accounts" : selected.label);
  };

  return <section className="report-assistant" aria-label="Assisted report creation">
    <ConversationInput className="report-request" value={request} onChange={setRequest} onSubmit={value => void submit(value)} label="Reporting request" heading="What would you like to report on?" headingIcon={<Icon name="sparkles" size="small" />} suggestions={reportSuggestions} submitLabel="Prepare report" submitContent={<Icon name="arrow-right" aria-hidden="true" />} disabled={!runtimeToday} processing={conversation.state.status === "processing"} />
    {conversation.state.messages.length > 0 && <ConversationMessages messages={conversation.state.messages} processing={conversation.state.status === "processing"} processingLabel="Preparing your report configuration" />}
    {(clarification || action || conversation.state.error) && <div ref={responseRef} className="report-assistant__response" tabIndex={-1}>
      {clarification && <ConversationClarificationControls clarification={clarification} onChange={choiceId => conversation.selectClarification(choiceId)} onConfirm={confirmClarification} onCancel={conversation.reset} />}
      {action && <PreparedReportAction action={action} accounts={context.accounts} today={runtimeToday} onReview={review} />}
      {conversation.state.error && <div className="report-assistant__error" role="alert"><strong>We could not prepare that request</strong><p>{conversation.state.error}</p><Button type="button" variant="secondary" size="small" onClick={conversation.reset}>Start again</Button></div>}
    </div>}
  </section>;
}

function PreparedReportAction({ action, accounts, today, onReview }: Readonly<{ action: ReportingConversationAction; accounts: ReportingConversationContext["accounts"]; today: string; onReview: () => void }>) {
  const configuration = action.configuration;
  const period = action.type === "manual-report-configuration" && action.unresolved === "period" ? undefined : resolveReportPeriod(configuration.period, today);
  const selected = accounts.filter(account => configuration.selectedAccountIds.includes(account.id));
  return <ConversationAction title={action.type === "report-configuration-prepared" ? "Report configuration prepared" : "Continue report configuration"} actions={<Button type="button" onClick={onReview}>{action.type === "report-configuration-prepared" ? "Review report" : "Continue manually"}</Button>}>
    <dl className="report-assistant-summary">
      <div><dt>Report type</dt><dd>Transaction activity</dd></div>
      <div><dt>Accounts</dt><dd>{selected.length === 1 ? selected[0]!.name : selected.length ? `${selected.length} selected` : "Select manually"}</dd></div>
      <div><dt>Reporting period</dt><dd>{period ? `${formatDate(period.from)}–${formatDate(period.to)}` : "Choose manually"}</dd></div>
      <div><dt>Direction</dt><dd>{configuration.direction === "all" ? "All transactions" : configuration.direction === "incoming" ? "Incoming" : "Outgoing"}</dd></div>
      {(configuration.filters.minimumAmount || configuration.filters.maximumAmount) && <div><dt>Amount</dt><dd>{amountSummary(configuration)}</dd></div>}
      {configuration.filters.currency && <div><dt>Currency</dt><dd>{configuration.filters.currency}</dd></div>}
      <div><dt>Output</dt><dd>CSV</dd></div>
      {configuration.mode === "recurring" && <div><dt>Recurrence</dt><dd>Monthly</dd></div>}
    </dl>
    {action.type === "manual-report-configuration" && <p>{action.reason}</p>}
  </ConversationAction>;
}

function queryFromConfiguration(configuration: ReportConfiguration, organisationId: string, today: string) { return { organisationId, selectedAccountIds: configuration.selectedAccountIds, period: resolveReportPeriod(configuration.period, today), direction: configuration.direction, minimumAmountMinor: amountInputToMinor(configuration.filters.minimumAmount), maximumAmountMinor: amountInputToMinor(configuration.filters.maximumAmount), currency: configuration.filters.currency || undefined }; }
function amountSummary(configuration: ReportConfiguration) { const { minimumAmount, maximumAmount } = configuration.filters; if (minimumAmount && maximumAmount) return `${minimumAmount}–${maximumAmount}`; if (minimumAmount) return `At least ${minimumAmount}`; return `At most ${maximumAmount}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
