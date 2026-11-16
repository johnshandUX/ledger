import { Suspense } from "react";
import { ReportRequestInput } from "./ReportRequestInput";
import { ReportingHeaderAction } from "./ReportingHeaderAction";
import { ReportingWorkspace } from "./ReportingWorkspace";

export function ReportingHome() {
  return <div className="page reporting-page">
    <header className="reporting-page-header"><div><h1>Reporting</h1><p>Create, manage and automate financial reports.</p></div><ReportingHeaderAction /></header>
    <div className="reporting-content"><ReportRequestInput /><Suspense fallback={null}><ReportingWorkspace /></Suspense></div>
  </div>;
}
