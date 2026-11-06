import Link from "next/link";
import { Card, CardBody } from "@johnshandux/ledger-design-system";
import { ProductShell } from "../../ProductShell";
import "../../accounts.css";
import "../expenses.css";

export default function AllExpensesActivityPage() {
  return <ProductShell activeRoute="expenses"><div className="page expenses-page expenses-activity-page">
    <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/expenses">Expenses</Link></li><li aria-current="page">All activity</li></ol></nav>
    <header className="expenses-page-header">
      <h1>All expenses activity</h1>
      <p>Review expense activity across every team and export it from one place.</p>
    </header>
    <Card>
      <CardBody>
        <div className="expenses-activity-placeholder">
          <h2>All activity is coming soon</h2>
          <p>This page will provide the complete organisation-wide expense history and export tools.</p>
        </div>
      </CardBody>
    </Card>
  </div></ProductShell>;
}
