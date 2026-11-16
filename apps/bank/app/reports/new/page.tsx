import "../../accounts.css";
import { ProductShell } from "../../ProductShell";
import { getBankAccounts } from "../../../src/finance/accounts";
import { ReportCreationWorkspace } from "./ReportCreationWorkspace";
import "./report-create.css";

export default function NewReportPage() {
  return <ProductShell activeRoute="reports"><ReportCreationWorkspace accounts={getBankAccounts()} /></ProductShell>;
}
