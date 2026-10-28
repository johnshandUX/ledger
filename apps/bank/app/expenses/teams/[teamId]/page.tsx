import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductShell } from "../../../ProductShell";
import { ExpenseActivity, TeamCardholders, TeamCards, TeamFinancialSummary } from "../../expenses";
import { getExpenseTeamModel, getExpenseTeamStaticParams } from "../../expense-data";
import "../../../accounts.css";
import "../../expenses.css";

export const dynamicParams = false;
export function generateStaticParams() { return getExpenseTeamStaticParams(); }

export default async function ExpenseTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const model = getExpenseTeamModel(teamId);
  if (!model) notFound();
  return <ProductShell activeRoute="expenses"><div className="page expenses-page expenses-team-page">
    <nav className="breadcrumb" aria-label="Breadcrumb"><ol><li><Link className="ledger-link" href="/expenses">Expenses</Link></li><li aria-current="page">{model.team.name}</li></ol></nav>
    <header className="expenses-page-header"><h1>{model.team.name}</h1></header>
    <div className="expenses-content">
      <TeamFinancialSummary model={model} />
      <TeamCardholders model={model} />
      <TeamCards model={model} />
      <ExpenseActivity heading="Recent spending" includeTeam={false} items={model.recentTransactions} />
    </div>
  </div></ProductShell>;
}
