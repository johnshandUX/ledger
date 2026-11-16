"use client";

import { Badge, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, type BadgeVariant } from "@johnshandux/ledger-design-system";
import { useRouter, useSearchParams } from "next/navigation";
import { type KeyboardEvent, useEffect, useId, useRef } from "react";
import { downloadReportOutput } from "../../src/reporting/csv";
import type { RecurringReportSchedule, ReportDefinition } from "../../src/reporting/types";
import { useBankOrganisation } from "../BankOrganisationProvider";
import { useReportingDispatch, useReportingState } from "../ReportingStateProvider";
import { ConnectedSystemIcon } from "./ConnectedSystemIcon";
import { connectedReportProcesses, reports, type ReportStatus } from "./reporting-data";

const reportStatusVariants: Record<ReportStatus, BadgeVariant> = { Active: "success", Ready: "informational", Generating: "warning" };
const tabs = ["my-reports", "connected-reporting"] as const;
type ReportingTab = (typeof tabs)[number];

export function reportingTabFromParam(value: string | null): ReportingTab { return value === "connected" ? "connected-reporting" : "my-reports"; }

function ScheduleConfirmation({ schedule }: { schedule?: RecurringReportSchedule }) {
  const dispatch = useReportingDispatch();
  useEffect(() => {
    if (!schedule) return;
    const consume = () => dispatch({ type: "schedule-confirmation-consumed", scheduleId: schedule.id });
    const timer = window.setTimeout(consume, 5000);
    return () => { window.clearTimeout(timer); consume(); };
  }, [dispatch, schedule]);
  if (!schedule) return null;
  return <div className="reporting-confirmation" role="status"><strong>Recurring report created</strong><span>{schedule.delivery === "my-reports" ? "Your monthly report is now listed in My reports." : "Your monthly report is now listed under Caldermere Finance ERP."}</span></div>;
}

function MyReports() {
  const state = useReportingState();
  const { activeOrganisationId, activeOrganisation } = useBankOrganisation();
  const created = state.definitions.filter(definition => definition.organisationId === activeOrganisationId).map(definition => {
    const run = state.runs.find(item => item.definitionId === definition.id);
    const schedule = state.schedules.find(item => item.definitionId === definition.id);
    const output = run ? state.outputs.find(item => item.id === run.outputId) : undefined;
    return { definition, run, schedule, output };
  }).filter(item => Boolean(item.run) || item.schedule?.delivery === "my-reports");
  const latest = state.schedules.find(item => item.id === state.latestCreatedScheduleId && item.delivery === "my-reports" && state.definitions.some(definition => definition.id === item.definitionId && definition.organisationId === activeOrganisationId));
  return <>
    <ScheduleConfirmation schedule={latest} />
    <div className="my-reports-table"><Table ariaLabel={`Reports for ${activeOrganisation.name}`}><TableHead><TableRow><TableHeaderCell>Report</TableHeaderCell><TableHeaderCell>Type</TableHeaderCell><TableHeaderCell>Scope</TableHeaderCell><TableHeaderCell>Created</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Action</TableHeaderCell></TableRow></TableHead><TableBody>
      {created.map(({ definition, run, schedule, output }) => <TableRow key={definition.id}><TableCell><strong>{definition.name}</strong></TableCell><TableCell>{schedule ? "Recurring · Monthly" : "One-off"}</TableCell><TableCell>{schedule ? `Next run: ${formatScheduleDateTime(schedule.nextScheduledRun)}` : formatPeriod(run!.reportingPeriod)}</TableCell><TableCell>{schedule ? "—" : formatDateTime(definition.createdAt)}</TableCell><TableCell><Badge variant={schedule ? "success" : "informational"}>{schedule ? "Active" : "Completed"}</Badge></TableCell><TableCell>{output ? <button className="ledger-link report-download-action" type="button" onClick={() => downloadReportOutput(output)}>Download CSV</button> : "—"}</TableCell></TableRow>)}
      {reports.map(report => <TableRow key={report.id}><TableCell><strong>{report.name}</strong></TableCell><TableCell>{report.type.replace(" report", "")}</TableCell><TableCell>{report.scope}</TableCell><TableCell>—</TableCell><TableCell><Badge variant={reportStatusVariants[report.status]}>{report.status}</Badge></TableCell><TableCell>—</TableCell></TableRow>)}
    </TableBody></Table></div>
    <ol className="my-reports-mobile" aria-label={`Reports for ${activeOrganisation.name}`}>
      {created.map(({ definition, run, schedule, output }) => <li key={definition.id}><div className="my-report-card__header"><strong>{definition.name}</strong><Badge variant={schedule ? "success" : "informational"}>{schedule ? "Active" : "Completed"}</Badge></div><p>{schedule ? "Recurring · Monthly" : `One-off · ${formatDateTime(definition.createdAt)}`}</p><span>{schedule ? `Next run: ${formatScheduleDateTime(schedule.nextScheduledRun)}` : formatPeriod(run!.reportingPeriod)}</span>{output && <button className="ledger-link report-download-action" type="button" onClick={() => downloadReportOutput(output)}>Download CSV</button>}</li>)}
      {reports.map(report => <li key={report.id}><div className="my-report-card__header"><strong>{report.name}</strong><Badge variant={reportStatusVariants[report.status]}>{report.status}</Badge></div><p>{report.type.replace(" report", "")}</p><span>{report.scope}</span></li>)}
    </ol>
  </>;
}

type ConnectedProcessView = Readonly<{ id: string; name: string; kind: string; cadence: string; activity: string; status: "Delivered" | "Scheduled" | "Active" }>;
function connectedScheduleView(definition: ReportDefinition, schedule: RecurringReportSchedule): ConnectedProcessView {
  return { id: schedule.id, name: definition.name, kind: "Scheduled file delivery", cadence: "Monthly", activity: `Next run: ${formatScheduleDateTime(schedule.nextScheduledRun)}`, status: "Active" };
}

function ConnectedReporting() {
  const state = useReportingState();
  const { activeOrganisationId } = useBankOrganisation();
  const created = state.schedules.filter(schedule => schedule.delivery === "caldermere-finance-erp").flatMap(schedule => {
    const definition = state.definitions.find(item => item.id === schedule.definitionId && item.organisationId === activeOrganisationId);
    return definition ? [connectedScheduleView(definition, schedule)] : [];
  });
  const seeded: readonly ConnectedProcessView[] = connectedReportProcesses.map(process => ({ id: process.id, name: process.name, kind: process.kind, cadence: process.cadence, activity: process.timing ?? "Latest delivery: 11 November 2026, 06:00", status: process.status }));
  const processes = [...created, ...seeded];
  const latest = state.schedules.find(item => item.id === state.latestCreatedScheduleId && item.delivery === "caldermere-finance-erp" && state.definitions.some(definition => definition.id === item.definitionId && definition.organisationId === activeOrganisationId));
  return <div className="connected-reporting">
    <ScheduleConfirmation schedule={latest} />
    <div className="connected-reporting__summary"><ConnectedSystemIcon /><div className="connected-reporting__identity"><h2>Caldermere Finance ERP</h2><p>{processes.length} automated reporting processes · Latest delivery 11 November 2026, 06:00</p></div><Badge variant="success">Connected</Badge></div>
    <div className="connected-processes" role="table" aria-label="Caldermere Finance ERP reporting processes">
      <div className="connected-processes__header" role="row"><span role="columnheader">Process</span><span role="columnheader">Delivery</span><span role="columnheader">Activity</span><span role="columnheader">Status</span></div>
      {processes.map(process => <div className="connected-processes__row" role="row" key={process.id}><strong role="cell">{process.name}</strong><span role="cell"><span className="connected-processes__mobile-label">Delivery</span>{process.kind}<small>{process.cadence}</small></span><span role="cell"><span className="connected-processes__mobile-label">Activity</span>{process.activity}</span><span role="cell"><Badge variant={process.status === "Delivered" || process.status === "Active" ? "success" : "informational"}>{process.status}</Badge></span></div>)}
    </div>
  </div>;
}

function formatPeriod(period: { from: string; to: string }) { return `${formatDate(period.from)}–${formatDate(period.to)}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London", timeZoneName: "short" }).format(new Date(value)); }
function formatScheduleDateTime(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/London" }).format(date);
  return `${day} at ${time}`;
}

export function ReportingWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTab = reportingTabFromParam(searchParams?.get("tab") ?? null);
  const baseId = useId();
  const tabRefs = useRef<Record<ReportingTab, HTMLButtonElement | null>>({ "my-reports": null, "connected-reporting": null });
  const select = (tab: ReportingTab) => router.push(tab === "connected-reporting" ? "/reports?tab=connected" : "/reports");
  const selectAndFocus = (tab: ReportingTab) => { select(tab); window.setTimeout(() => tabRefs.current[tab]?.focus(), 0); };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tab: ReportingTab) => {
    const index = tabs.indexOf(tab);
    let next: ReportingTab | undefined;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    selectAndFocus(next);
  };
  return <section className="reporting-workspace" aria-label="Reporting workspace">
    <div className="reporting-tabs" role="tablist" aria-label="Reporting views">
      <button ref={node => { tabRefs.current["my-reports"] = node; }} id={`${baseId}-my-reports-tab`} type="button" role="tab" aria-selected={selectedTab === "my-reports"} aria-controls={`${baseId}-my-reports-panel`} tabIndex={selectedTab === "my-reports" ? 0 : -1} onClick={() => select("my-reports")} onKeyDown={event => onKeyDown(event, "my-reports")}>My reports</button>
      <button ref={node => { tabRefs.current["connected-reporting"] = node; }} id={`${baseId}-connected-reporting-tab`} type="button" role="tab" aria-selected={selectedTab === "connected-reporting"} aria-controls={`${baseId}-connected-reporting-panel`} tabIndex={selectedTab === "connected-reporting" ? 0 : -1} onClick={() => select("connected-reporting")} onKeyDown={event => onKeyDown(event, "connected-reporting")}>Connected reporting</button>
    </div>
    <div className="reporting-tabpanel" id={`${baseId}-my-reports-panel`} role="tabpanel" aria-labelledby={`${baseId}-my-reports-tab`} tabIndex={0} hidden={selectedTab !== "my-reports"}><MyReports /></div>
    <div className="reporting-tabpanel" id={`${baseId}-connected-reporting-panel`} role="tabpanel" aria-labelledby={`${baseId}-connected-reporting-tab`} tabIndex={0} hidden={selectedTab !== "connected-reporting"}><ConnectedReporting /></div>
  </section>;
}
