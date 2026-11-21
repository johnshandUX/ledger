"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, Button, Checkbox, Input, Radio, Select } from "@johnshandux/ledger-design-system";
import { Dialog, DialogBody, DialogContent, DialogFooter } from "@johnshandux/ledger-design-system/dialog";
import { DataTable, type DataTableColumn, type DataTableState } from "@johnshandux/ledger-design-system/data-table";
import type { BankAccount } from "../../../src/finance/accounts";
import { getBankOrganisationAccess } from "../../../src/finance/organisations";
import { isReportingAccountEligible, queryTransactionsForReport } from "../../../src/reporting/query";
import { downloadReportOutput } from "../../../src/reporting/csv";
import { createMonthlySchedule, generateOneOffReport } from "../../../src/reporting/operations";
import { calendarDateInTimeZone } from "../../../src/reporting/schedule";
import type { GeneratedReportOutput } from "../../../src/reporting/types";
import { useBankState } from "../../BankStateProvider";
import { useBankOrganisation } from "../../BankOrganisationProvider";
import { useReportingDispatch, useReportingIdSource, useReportingState } from "../../ReportingStateProvider";
import { useEffectiveAccounts } from "../../useBankEffectiveState";
import { amountInputToMinor, initialReportConfiguration, resolveReportPeriod, scheduleSummary, type ReportConfiguration, validateReportConfiguration } from "./report-configuration";

const periodLabels = { "last-month": "Last month", "last-three-complete-months": "Last three complete months", custom: "Custom date range", "previous-calendar-month": "Previous calendar month" } as const;
const directionLabels = { all: "All transactions", incoming: "Incoming", outgoing: "Outgoing" } as const;
const dayOptions = [{ label: "1st of the month", value: "1" }, { label: "5th of the month", value: "5" }, { label: "15th of the month", value: "15" }, { label: "Last day of the month", value: "last" }];

function isEligible(account: BankAccount) { return isReportingAccountEligible(account); }
function accountMatchesQuery(account: BankAccount, query: string) {
  const normalized = query.trim().toLocaleLowerCase("en-GB");
  return !normalized || [account.name, account.accountNumber, account.currency].some(value => value?.toLocaleLowerCase("en-GB").includes(normalized));
}

const accountColumns: readonly DataTableColumn<BankAccount>[] = [
  { id: "name", label: "Account name", header: "Account name", cell: ({ row }) => <strong>{row.name}</strong>, sort: { value: row => row.name } },
  { id: "number", label: "Account number", header: "Account number", nowrap: true, cell: ({ row }) => <span className="account-identifier">{row.accountNumber ?? row.id}</span> },
  { id: "currency", label: "Currency", header: "Currency", cell: ({ row }) => row.currency, sort: { value: row => row.currency } },
  { id: "status", label: "Status", header: "Status", cell: ({ row }) => row.status === "closed" ? <span>Closed — unavailable</span> : row.status === "restricted" ? "Restricted" : "Active", sort: { value: row => row.status } },
];

function AccountSelection({ accounts, selectedIds, onConfirm }: { accounts: readonly BankAccount[]; selectedIds: readonly string[]; onConfirm: (ids: readonly string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ReadonlySet<string>>(new Set(selectedIds));
  const [state, setState] = useState<DataTableState>({ query: "", filters: {}, pageIndex: 0, pageSize: 10 });
  const mobileSelectAllRef = useRef<HTMLInputElement>(null);
  const mobileVisibleAccounts = accounts.filter(account => accountMatchesQuery(account, state.query));
  const mobileEligibleAccounts = mobileVisibleAccounts.filter(isEligible);
  const mobileVisibleSelectedCount = mobileEligibleAccounts.filter(account => draft.has(account.id)).length;
  const mobileAllSelected = mobileEligibleAccounts.length > 0 && mobileVisibleSelectedCount === mobileEligibleAccounts.length;
  useEffect(() => {
    if (mobileSelectAllRef.current) mobileSelectAllRef.current.indeterminate = mobileVisibleSelectedCount > 0 && !mobileAllSelected;
  }, [mobileAllSelected, mobileVisibleSelectedCount]);
  const openPicker = () => { setDraft(new Set(selectedIds)); setOpen(true); };
  const cancel = () => { setDraft(new Set(selectedIds)); setOpen(false); };
  return <div className="report-account-field">
    <span className="report-field-label">Accounts</span>
    <div className="report-account-field__value">
      <span>{selectedIds.length === 0 ? "Select accounts" : `${selectedIds.length} ${selectedIds.length === 1 ? "account" : "accounts"} selected`}</span>
      <Button type="button" variant="secondary" size="small" aria-label={selectedIds.length === 0 ? "Select accounts" : "Change selected accounts"} onClick={openPicker}>{selectedIds.length === 0 ? "Select" : "Change"}</Button>
    </div>
    <Dialog open={open} onOpenChange={(next) => next ? openPicker() : cancel()}>
      <DialogContent className="report-account-dialog" mobileFullScreen title="Select accounts" description="Choose the eligible accounts to include in this transaction activity report.">
        <DialogBody>
          <div className="report-account-selection-heading">
            <strong aria-live="polite">{draft.size} of {accounts.filter(isEligible).length} accounts selected</strong>
            <Button type="button" variant="secondary" size="small" disabled={draft.size === 0} onClick={() => setDraft(new Set())}>Clear selection</Button>
          </div>
          <div className="report-account-table">
            <DataTable caption="Accounts available for reporting" rows={accounts} columns={accountColumns} getRowId={account => account.id} search={{ label: "Search accounts", placeholder: "Search accounts", values: account => [account.name, account.accountNumber, account.currency] }} pageSizeOptions={[10, 20, 50]} itemLabel={{ singular: "account", plural: "accounts" }} state={state} onStateChange={setState} selection={{ selectedRowIds: draft, onSelectedRowIdsChange: setDraft, isRowSelectable: isEligible, getRowSelectionLabel: account => `Select ${account.name}` }} />
          </div>
          <div className="report-account-mobile-list">
            <Input label="Search accounts" visuallyHiddenLabel type="search" placeholder="Search accounts" value={state.query} onChange={event => setState({ ...state, query: event.currentTarget.value, pageIndex: 0 })} />
            <label className="report-account-mobile-select-all"><input ref={mobileSelectAllRef} type="checkbox" aria-label="Select all eligible accounts shown" checked={mobileAllSelected} disabled={mobileEligibleAccounts.length === 0} onChange={event => { const next = new Set(draft); mobileEligibleAccounts.forEach(account => event.currentTarget.checked ? next.add(account.id) : next.delete(account.id)); setDraft(next); }} /><span>{mobileAllSelected ? "Deselect accounts shown" : "Select accounts shown"}</span></label>
            {mobileVisibleAccounts.map(account => <label key={account.id} className="report-account-option" data-selected={draft.has(account.id) || undefined} data-disabled={!isEligible(account) || undefined}>
              <input type="checkbox" checked={draft.has(account.id)} disabled={!isEligible(account)} onChange={event => { const next = new Set(draft); if (event.currentTarget.checked) next.add(account.id); else next.delete(account.id); setDraft(next); }} />
              <span><strong>{account.name}</strong><small>{account.accountNumber ?? account.id} · {account.currency} · {account.status === "closed" ? "Closed — unavailable" : account.status}</small></span>
            </label>)}
          </div>
        </DialogBody>
        <DialogFooter><Button type="button" variant="secondary" onClick={cancel}>Cancel</Button><Button type="button" onClick={() => { onConfirm([...draft]); setOpen(false); }}>Confirm selection</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}

export function ReportCreationWorkspace({ accounts, today }: { accounts: readonly BankAccount[]; today?: string }) {
  const router = useRouter();
  const { baseline } = useBankState();
  const effectiveAccountRecords = useEffectiveAccounts();
  const { activeOrganisationId, activeMembership } = useBankOrganisation();
  const dataOrganisationId = getBankOrganisationAccess(activeOrganisationId, activeMembership.userId)!.financialDataSourceBusinessId;
  const reportingDispatch = useReportingDispatch();
  const reportingState = useReportingState();
  const nextId = useReportingIdSource();
  const [configuration, setConfiguration] = useState<ReportConfiguration>(() => reportingState.assistedConfiguration ?? initialReportConfiguration);
  const [runtimeToday, setRuntimeToday] = useState(today ?? "");
  const [showFilters, setShowFilters] = useState(() => Boolean(reportingState.assistedConfiguration?.filters.minimumAmount || reportingState.assistedConfiguration?.filters.maximumAmount || reportingState.assistedConfiguration?.filters.currency));
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const submittingScheduleRef = useRef(false);
  const [success, setSuccess] = useState<{ kind: "report"; name: string; output: GeneratedReportOutput }>();
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (today) return;
    const timer = window.setTimeout(() => setRuntimeToday(calendarDateInTimeZone(new Date())), 0);
    return () => window.clearTimeout(timer);
  }, [today]);
  useEffect(() => { if (reportingState.assistedConfiguration) reportingDispatch({ type: "assisted-configuration-consumed" }); }, [reportingDispatch, reportingState.assistedConfiguration]);
  const effectiveToday = today ?? runtimeToday;
  const errors = useMemo(() => effectiveToday ? validateReportConfiguration(configuration, effectiveToday) : { today: "Preparing the reporting date." }, [configuration, effectiveToday]);
  const update = (changes: Partial<ReportConfiguration>) => { setSuccess(undefined); setConfiguration(current => ({ ...current, ...changes })); };
  const recurring = configuration.mode === "recurring";
  const ready = Object.keys(errors).length === 0;
  const displayAccounts = useMemo(() => accounts.map(account => ({ ...account, ...effectiveAccountRecords.find(record => record.id === account.id) })), [accounts, effectiveAccountRecords]);
  const reportingDataset = useMemo(() => ({ ...baseline, accounts: effectiveAccountRecords }), [baseline, effectiveAccountRecords]);
  const selectedCurrencies = [...new Set(displayAccounts.filter(account => configuration.selectedAccountIds.includes(account.id)).map(account => account.currency))];
  const resolvedPeriod = useMemo(() => ready ? resolveReportPeriod(configuration.period, effectiveToday) : undefined, [configuration.period, effectiveToday, ready]);
  const preview = useMemo(() => resolvedPeriod ? queryTransactionsForReport(reportingDataset, { organisationId: dataOrganisationId,
    selectedAccountIds: configuration.selectedAccountIds, period: resolvedPeriod, direction: configuration.direction,
    minimumAmountMinor: amountInputToMinor(configuration.filters.minimumAmount), maximumAmountMinor: amountInputToMinor(configuration.filters.maximumAmount),
    currency: configuration.filters.currency || undefined }) : undefined,
  [configuration.direction, configuration.filters, configuration.selectedAccountIds, dataOrganisationId, reportingDataset, resolvedPeriod]);
  useEffect(() => { if (success) successRef.current?.focus(); }, [success]);
  const submit = () => {
    if (!ready || success || submittingScheduleRef.current) return;
    const dependencies = { now: new Date(), referenceDate: effectiveToday, nextId };
    if (recurring) {
      submittingScheduleRef.current = true;
      setSubmittingSchedule(true);
      const created = createMonthlySchedule(reportingDataset, configuration, activeOrganisationId, dependencies, dataOrganisationId);
      reportingDispatch({ type: "schedule-created", ...created });
      router.push(configuration.schedule.delivery === "caldermere-finance-erp" ? "/reports?tab=connected" : "/reports");
    } else {
      const created = generateOneOffReport(reportingDataset, configuration, activeOrganisationId, dependencies, dataOrganisationId);
      reportingDispatch({ type: "report-generated", definition: created.definition, run: created.run, output: created.output });
      setSuccess({ kind: "report", name: created.definition.name, output: created.output });
    }
  };
  const reset = () => { setConfiguration(initialReportConfiguration); setShowFilters(false); setSuccess(undefined); };
  return <div className="page report-create-page">
    <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/reports">Reporting</Link></li><li aria-current="page">Create report</li></ol></nav>
    <h1>Create report</h1>
    {success && <div ref={successRef} className="report-success" role="status" tabIndex={-1}><strong>Report created</strong><p>{success.name}</p><div><Link className="ledger-link" href="/reports">View My reports</Link><Button type="button" variant="secondary" size="small" onClick={() => downloadReportOutput(success.output)}>Download CSV</Button><Button type="button" variant="secondary" size="small" onClick={reset}>Create another report</Button></div></div>}
    <div className="report-create-layout">
      <div className="report-form" aria-label="Report configuration">
        <section className="report-section"><h2>Report details</h2>
          <Select id="report-type" label="Report type" value={configuration.reportType} onChange={() => {}} options={[{ label: "Transaction activity", value: "transaction-activity" }]} />
          <Input id="report-name" label="Report name" hint={recurring ? "Required for recurring reports." : "Optional for one-off reports."} value={configuration.reportName} onChange={event => update({ reportName: event.currentTarget.value })} error={errors.reportName} />
          <AccountSelection accounts={displayAccounts} selectedIds={configuration.selectedAccountIds} onConfirm={selectedAccountIds => update({ selectedAccountIds })} />
          {errors.accounts && <p className="report-field-error" role="alert">{errors.accounts}</p>}
        </section>

        <section className="report-section"><h2>Reporting period</h2>
          <fieldset className="report-choice-group"><legend>Period</legend>{(["last-month", "last-three-complete-months", "custom"] as const).map(kind => <Radio key={kind} id={`period-${kind}`} name="period" label={periodLabels[kind]} checked={configuration.period.kind === kind} onChange={() => update({ period: kind === "custom" ? { kind, from: "", to: "" } : { kind } })} />)}</fieldset>
          {configuration.period.kind === "custom" && <div className="report-date-grid"><Input id="report-from" type="date" label="From" max={effectiveToday} value={configuration.period.from} onChange={event => update({ period: { kind: "custom", from: event.currentTarget.value, to: configuration.period.kind === "custom" ? configuration.period.to : "" } })} error={errors.from} /><Input id="report-to" type="date" label="To" max={effectiveToday} value={configuration.period.to} onChange={event => update({ period: { kind: "custom", from: configuration.period.kind === "custom" ? configuration.period.from : "", to: event.currentTarget.value } })} error={errors.to} /></div>}
          <div className="report-limitation"><strong>Data availability</strong><span>{!preview ? "Complete the reporting period and account selection to check observed records." : preview.coverage.accountIdsWithHistory.length === 0 ? "No observed transaction records are available for the selected accounts." : preview.coverage.startsBeforeObservedRecords || preview.coverage.endsAfterObservedRecords ? `The request extends beyond the observed records for these accounts (${preview.coverage.earliestObservedDate} to ${preview.coverage.latestObservedDate}). This does not establish complete historical coverage.` : `${preview.coverage.earliestObservedDate} to ${preview.coverage.latestObservedDate} is the observed transaction range for the selected accounts.`}</span>{preview && preview.coverage.accountIdsWithoutHistory.length > 0 && <span>{preview.coverage.accountIdsWithoutHistory.length} selected {preview.coverage.accountIdsWithoutHistory.length === 1 ? "account has" : "accounts have"} no observed transaction history.</span>}</div>
        </section>

        <section className="report-section"><h2>Refine results</h2>
          <fieldset className="report-choice-group report-choice-group--inline"><legend>Transaction direction</legend>{(["all", "incoming", "outgoing"] as const).map(direction => <Radio key={direction} id={`direction-${direction}`} name="direction" label={directionLabels[direction]} checked={configuration.direction === direction} onChange={() => update({ direction })} />)}</fieldset>
          <Button type="button" variant="secondary" size="small" aria-expanded={showFilters} onClick={() => setShowFilters(value => !value)}>{showFilters ? "Hide additional filters" : "Add filters"}</Button>
          {showFilters && <div className="report-filter-grid"><Input id="minimum-amount" type="number" min="0" step="0.01" label="Minimum amount" value={configuration.filters.minimumAmount} onChange={event => update({ filters: { ...configuration.filters, minimumAmount: event.currentTarget.value } })} error={errors.minimumAmount} /><Input id="maximum-amount" type="number" min="0" step="0.01" label="Maximum amount" value={configuration.filters.maximumAmount} onChange={event => update({ filters: { ...configuration.filters, maximumAmount: event.currentTarget.value } })} error={errors.maximumAmount} /><Select id="report-currency" label="Currency" hint="Transactions remain in their original currency; no conversion is applied." value={configuration.filters.currency} onChange={event => update({ filters: { ...configuration.filters, currency: event.currentTarget.value } })} options={[{ label: "All selected account currencies", value: "" }, ...selectedCurrencies.map(currency => ({ label: currency, value: currency }))]} /></div>}
        </section>

        <section className="report-section"><h2>Output and delivery</h2>
          <Select id="output-format" label="Output format" value="csv" onChange={() => {}} options={[{ label: "CSV", value: "csv" }]} />
          <Checkbox id="recurring-report" label="Make this a recurring report" hint="Generate this report automatically." checked={recurring} onChange={event => update({ mode: event.currentTarget.checked ? "recurring" : "one-off", period: event.currentTarget.checked ? { kind: "previous-calendar-month" } : { kind: "last-month" } })} />
          {recurring && <div className="report-schedule-fields">
            <Select label="Frequency" value="monthly" onChange={() => {}} options={[{ label: "Monthly", value: "monthly" }]} />
            <div className="report-schedule-grid"><Select label="Execution day" value={configuration.schedule.executionDay} onChange={event => update({ schedule: { ...configuration.schedule, executionDay: event.currentTarget.value as ReportConfiguration["schedule"]["executionDay"] } })} options={dayOptions} /><Select label="Execution time" value={configuration.schedule.executionTime} onChange={event => update({ schedule: { ...configuration.schedule, executionTime: event.currentTarget.value as ReportConfiguration["schedule"]["executionTime"] } })} options={[{ label: "06:00", value: "06:00" }, { label: "09:00", value: "09:00" }, { label: "18:00", value: "18:00" }]} /></div>
            <p className="report-timezone">Timezone: Europe/London</p>
            <fieldset className="report-choice-group"><legend>Delivery</legend><Radio id="delivery-reports" name="delivery" label="Save to My reports" checked={configuration.schedule.delivery === "my-reports"} onChange={() => update({ schedule: { ...configuration.schedule, delivery: "my-reports" } })} /><Radio id="delivery-erp" name="delivery" label="Send to Caldermere Finance ERP" checked={configuration.schedule.delivery === "caldermere-finance-erp"} onChange={() => update({ schedule: { ...configuration.schedule, delivery: "caldermere-finance-erp" } })} /></fieldset>
            <p className="report-schedule-summary">{scheduleSummary(configuration)}</p>
          </div>}
          <Button type="button" disabled={!ready || Boolean(success) || submittingSchedule} onClick={submit}>{recurring ? "Create schedule" : "Generate report"}</Button>
        </section>
      </div>
      <aside className="report-summary" aria-labelledby="report-summary-title"><h2 id="report-summary-title">Report summary</h2><dl><div><dt>Report type</dt><dd>Transaction activity</dd></div><div><dt>Accounts</dt><dd>{configuration.selectedAccountIds.length} selected</dd></div><div><dt>Reporting period</dt><dd>{resolvedPeriod ? `${formatDate(resolvedPeriod.from)}–${formatDate(resolvedPeriod.to)}` : periodLabels[configuration.period.kind]}</dd></div><div><dt>Direction</dt><dd>{directionLabels[configuration.direction]}</dd></div><div><dt>Output</dt><dd>CSV</dd></div><div><dt>Reporting mode</dt><dd>{recurring ? "Recurring" : "One-off"}</dd></div></dl><Alert variant={ready ? "informational" : "warning"} role="status"><AlertDescription>{!ready ? configuration.selectedAccountIds.length === 0 ? "Select at least one account to continue." : "Complete the required configuration to continue." : preview?.rows.length === 0 ? "No transactions match the selected accounts and filters. An empty CSV with headers can still be generated." : `${preview?.rows.length ?? 0} matching ${(preview?.rows.length ?? 0) === 1 ? "transaction" : "transactions"}.`}</AlertDescription></Alert>{preview && <div className="report-preview-placeholder"><strong>Preview</strong><p>{preview.rows.length} {(preview.rows.length) === 1 ? "transaction" : "transactions"} across {configuration.selectedAccountIds.length} selected {configuration.selectedAccountIds.length === 1 ? "account" : "accounts"}.</p><p>Currencies represented: {preview.representedCurrencies.length ? preview.representedCurrencies.join(", ") : "None"}.</p>{preview.rows.length > 0 && <ol className="report-preview-sample">{preview.rows.slice(0, 3).map(row => <li key={row.transactionId}><span>{formatDate(row.transactionDate)}</span><strong>{row.description}</strong><span>{row.currency} {formatMinor(row.amountMinor)}</span></li>)}</ol>}</div>}</aside>
    </div>
  </div>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function formatMinor(value: number) { return `${Math.floor(value / 100).toLocaleString("en-GB")}.${String(Math.abs(value) % 100).padStart(2, "0")}`; }
