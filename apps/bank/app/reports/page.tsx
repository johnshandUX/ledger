import "../accounts.css";
import { ProductShell } from "../ProductShell";
import { ReportingHome } from "./ReportingHome";
import "./reporting.css";

export default function ReportsPage() {
  return (
    <ProductShell activeRoute="reports">
      <ReportingHome />
    </ProductShell>
  );
}
