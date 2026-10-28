import { ProductShell } from "../ProductShell";
import { ExpenseActivity, ExpenseAttention, ExpensesSummary, TeamSpendingList } from "./expenses";
import { getExpensesOverviewModel } from "./expense-data";
import "../accounts.css";
import "./expenses.css";

export default function ExpensesPage() {
  const model = getExpensesOverviewModel();
  return <ProductShell activeRoute="expenses"><div className="page expenses-page">
    <header className="expenses-page-header"><h1>Expenses</h1></header>
    <div className="expenses-content">
      <ExpensesSummary summary={model.summary} />
      <ExpenseAttention summary={model.summary} />
      <TeamSpendingList teams={model.teams} />
      <ExpenseActivity items={model.recentTransactions} />
    </div>
  </div></ProductShell>;
}
