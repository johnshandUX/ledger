"use client";

import { Badge, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, type BadgeVariant } from "@johnshandux/ledger-design-system";
import { type KeyboardEvent, useId, useRef, useState } from "react";
import { ConnectedSystemIcon } from "./ConnectedSystemIcon";
import { connectedReportProcesses, reports, type ReportStatus } from "./reporting-data";

const reportStatusVariants: Record<ReportStatus, BadgeVariant> = { Active: "success", Ready: "informational", Generating: "warning" };
const tabs = ["my-reports", "connected-reporting"] as const;
type ReportingTab = (typeof tabs)[number];

function MyReports() {
  return <>
    <div className="my-reports-table"><Table ariaLabel="Illustrative reports for Caldermere Ltd"><TableHead><TableRow><TableHeaderCell>Report</TableHeaderCell><TableHeaderCell>Type</TableHeaderCell><TableHeaderCell>Scope</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHead><TableBody>{reports.map((report) => <TableRow key={report.id}><TableCell><strong>{report.name}</strong></TableCell><TableCell>{report.type.replace(" report", "")}</TableCell><TableCell>{report.scope}</TableCell><TableCell><Badge variant={reportStatusVariants[report.status]}>{report.status}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
    <ol className="my-reports-mobile" aria-label="Illustrative reports for Caldermere Ltd">{reports.map((report) => <li key={report.id}><div className="my-report-card__header"><strong>{report.name}</strong><Badge variant={reportStatusVariants[report.status]}>{report.status}</Badge></div><p>{report.type.replace(" report", "")}</p><span>{report.scope}</span></li>)}</ol>
  </>;
}

function ConnectedReporting() {
  return <div className="connected-reporting">
    <div className="connected-reporting__summary">
      <ConnectedSystemIcon />
      <div className="connected-reporting__identity"><h2>Caldermere Finance ERP</h2><p>3 automated reporting processes · Latest delivery 11 November 2026, 06:00</p></div>
      <Badge variant="success">Connected</Badge>
    </div>
    <div className="connected-processes" role="table" aria-label="Automated reporting processes">
      <div className="connected-processes__header" role="row"><span role="columnheader">Process</span><span role="columnheader">Delivery</span><span role="columnheader">Activity</span><span role="columnheader">Status</span></div>
      {connectedReportProcesses.map((process) => <div className="connected-processes__row" role="row" key={process.id}>
        <strong role="cell">{process.name}</strong>
        <span role="cell"><span className="connected-processes__mobile-label">Delivery</span>{process.kind}<small>{process.cadence}</small></span>
        <span role="cell"><span className="connected-processes__mobile-label">Activity</span>{process.timing ?? "Latest delivery: 11 November 2026, 06:00"}</span>
        <span role="cell"><Badge variant={process.status === "Delivered" ? "success" : "informational"}>{process.status}</Badge></span>
      </div>)}
    </div>
  </div>;
}

export function ReportingWorkspace() {
  const [selectedTab, setSelectedTab] = useState<ReportingTab>("my-reports");
  const baseId = useId();
  const tabRefs = useRef<Record<ReportingTab, HTMLButtonElement | null>>({ "my-reports": null, "connected-reporting": null });

  const selectAndFocus = (tab: ReportingTab) => { setSelectedTab(tab); tabRefs.current[tab]?.focus(); };
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
      <button ref={(node) => { tabRefs.current["my-reports"] = node; }} id={`${baseId}-my-reports-tab`} type="button" role="tab" aria-selected={selectedTab === "my-reports"} aria-controls={`${baseId}-my-reports-panel`} tabIndex={selectedTab === "my-reports" ? 0 : -1} onClick={() => setSelectedTab("my-reports")} onKeyDown={(event) => onKeyDown(event, "my-reports")}>My reports</button>
      <button ref={(node) => { tabRefs.current["connected-reporting"] = node; }} id={`${baseId}-connected-reporting-tab`} type="button" role="tab" aria-selected={selectedTab === "connected-reporting"} aria-controls={`${baseId}-connected-reporting-panel`} tabIndex={selectedTab === "connected-reporting" ? 0 : -1} onClick={() => setSelectedTab("connected-reporting")} onKeyDown={(event) => onKeyDown(event, "connected-reporting")}>Connected reporting</button>
    </div>
    <div className="reporting-tabpanel" id={`${baseId}-my-reports-panel`} role="tabpanel" aria-labelledby={`${baseId}-my-reports-tab`} tabIndex={0} hidden={selectedTab !== "my-reports"}><MyReports /></div>
    <div className="reporting-tabpanel" id={`${baseId}-connected-reporting-panel`} role="tabpanel" aria-labelledby={`${baseId}-connected-reporting-tab`} tabIndex={0} hidden={selectedTab !== "connected-reporting"}><ConnectedReporting /></div>
  </section>;
}
