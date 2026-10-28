import Link from "next/link";
import { Badge, Card, CardBody, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, type BadgeVariant } from "@johnshandux/ledger-design-system";
import type { CardTransactionStatus, CardTransactionType, CurrencyCode, ExpenseCardholderStatus, ExpenseCardStatus, ExpenseOrganisationSummary, ExpenseTeamSummary, ExpenseTransactionDetails } from "@johnshandux/ledger-synthetic-finance";
import { formatMinorCurrencyAmount } from "../../src/presentation/money";
import type { getExpenseTeamModel } from "./expense-data";

type TeamModel = NonNullable<ReturnType<typeof getExpenseTeamModel>>;
const formatPercentage = (value: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value) + "%";
const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
const titleCase = (value: string) => value.replaceAll("_", " ").replace(/(^|\s)\S/g, (character) => character.toUpperCase());
const capitaliseFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const transactionStatusVariants: Record<CardTransactionStatus, BadgeVariant> = { settled: "success", pending: "informational", declined: "error", reversed: "neutral" };
const cardStatusVariants: Record<ExpenseCardStatus, BadgeVariant> = { active: "success", pending_activation: "informational", frozen: "warning", expired: "neutral", cancelled: "error" };
const cardholderStatusVariants: Record<ExpenseCardholderStatus, BadgeVariant> = { active: "success", pending_activation: "informational", frozen: "warning", removed: "neutral" };

function TransactionStatus({ status }: { status: CardTransactionStatus }) {
  return <Badge variant={transactionStatusVariants[status]}>{titleCase(status)}</Badge>;
}
function CardStatus({ status }: { status: ExpenseCardStatus }) {
  return <Badge variant={cardStatusVariants[status]}>{titleCase(status)}</Badge>;
}
function CardholderStatus({ status }: { status: ExpenseCardholderStatus }) {
  return <Badge className="expense-cardholder-status" variant={cardholderStatusVariants[status]}>{titleCase(status)}</Badge>;
}
function transactionAmount(amountMinor: number, currency: CurrencyCode, type: CardTransactionType) {
  return formatMinorCurrencyAmount(type === "refund" ? -amountMinor : amountMinor, currency);
}
function BudgetBar({ utilisation, teamName }: { utilisation: number; teamName: string }) {
  return <div className="expense-utilisation" aria-label={`${teamName} has used ${formatPercentage(utilisation)} of its monthly budget`}>
    <span className="expense-utilisation__track" aria-hidden="true"><span className={`expense-utilisation__fill${utilisation > 100 ? " expense-utilisation__fill--over" : ""}`} style={{ width: `${Math.min(Math.max(utilisation, 0), 100)}%` }} /></span>
    <span className="financial-value">{formatPercentage(utilisation)}</span>
  </div>;
}

export function ExpensesSummary({ summary }: { summary: ExpenseOrganisationSummary }) {
  const metrics = [
    ["Spent this month", formatMinorCurrencyAmount(summary.settledSpendingMinor, summary.currency)],
    ["Pending spend", formatMinorCurrencyAmount(summary.pendingSpendingMinor, summary.currency)],
    ["Active cards", summary.activeCardCount.toString()],
    ["Missing receipts", summary.attention.missingReceipts.toString()],
  ];
  return <section aria-labelledby="expenses-summary-heading"><div className="expenses-section-heading expenses-section-heading--compact"><h2 id="expenses-summary-heading">Summary</h2></div><Card className="expenses-summary-card"><CardBody><dl className="expenses-summary-grid">{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="financial-value">{value}</dd></div>)}</dl></CardBody></Card></section>;
}

function RemainingBudget({ summary }: { summary: ExpenseTeamSummary }) {
  if (summary.remainingBudgetMinor === undefined || !summary.budget) return <span>Not set</span>;
  const over = summary.remainingBudgetMinor < 0;
  return <span className={over ? "expense-over-budget" : undefined}>{formatMinorCurrencyAmount(Math.abs(summary.remainingBudgetMinor), summary.budget.currency)} {over ? "over budget" : "remaining"}</span>;
}

export function TeamSpendingList({ teams }: { teams: ExpenseTeamSummary[] }) {
  if (!teams.length) return <section aria-labelledby="team-spending-heading"><div className="expenses-section-heading"><h2 id="team-spending-heading">Team spending</h2></div><div className="empty-state"><h3>No teams to display</h3><p>Team spending will appear when expense teams are available.</p></div></section>;
  return <section className="expenses-team-section" aria-labelledby="team-spending-heading"><div className="expenses-section-heading"><h2 id="team-spending-heading">Team spending</h2></div>
    <div className="expenses-team-table"><Table ariaLabel="Team spending for October 2026"><TableHead><TableRow><TableHeaderCell>Team</TableHeaderCell><TableHeaderCell align="right">Spent</TableHeaderCell><TableHeaderCell align="right">Monthly budget</TableHeaderCell><TableHeaderCell>Utilisation</TableHeaderCell><TableHeaderCell>Remaining</TableHeaderCell><TableHeaderCell><span className="visually-hidden">Team details</span></TableHeaderCell></TableRow></TableHead><TableBody>{teams.map((summary) => <TableRow key={summary.team.id}>
      <TableCell><Link className="ledger-link expense-team-link" href={`/expenses/teams/${summary.team.id}`}>{summary.team.name}</Link></TableCell>
      <TableCell align="right"><span className="financial-value">{formatMinorCurrencyAmount(summary.settledSpendingMinor, summary.budget?.currency ?? "GBP")}</span></TableCell>
      <TableCell align="right"><span className="financial-value">{summary.budget ? formatMinorCurrencyAmount(summary.budget.amountMinor, summary.budget.currency) : "Not set"}</span></TableCell>
      <TableCell>{summary.budgetUtilisationPercentage === undefined ? "Not available" : <BudgetBar utilisation={summary.budgetUtilisationPercentage} teamName={summary.team.name} />}</TableCell>
      <TableCell><RemainingBudget summary={summary} /></TableCell>
      <TableCell align="right"><Link className="expense-team-action" href={`/expenses/teams/${summary.team.id}`} aria-label={`View ${summary.team.name} team details`}><span aria-hidden="true">›</span></Link></TableCell>
    </TableRow>)}</TableBody></Table></div>
    <ol className="expenses-team-mobile" aria-label="Team spending for October 2026">{teams.map((summary) => <li key={summary.team.id}><Link className="expense-team-card" href={`/expenses/teams/${summary.team.id}`}><div className="expense-team-card__header"><strong>{summary.team.name}</strong><span aria-hidden="true">›</span></div><p><strong className="financial-value">{formatMinorCurrencyAmount(summary.settledSpendingMinor, summary.budget?.currency ?? "GBP")}</strong> spent{summary.budget ? ` of ${formatMinorCurrencyAmount(summary.budget.amountMinor, summary.budget.currency)}` : ""}</p>{summary.budgetUtilisationPercentage !== undefined ? <BudgetBar utilisation={summary.budgetUtilisationPercentage} teamName={summary.team.name} /> : null}<span className="expense-team-card__remaining"><RemainingBudget summary={summary} /></span></Link></li>)}</ol>
  </section>;
}

export function ExpenseAttention({ summary }: { summary: ExpenseOrganisationSummary }) {
  const items = [["Missing receipts", summary.attention.missingReceipts], ["Pending review", summary.attention.pendingReview], ["Unreconciled", summary.attention.unreconciled]] as const;
  return <section aria-labelledby="expense-attention-heading"><div className="expenses-section-heading"><h2 id="expense-attention-heading">Needs attention</h2></div><div className="expense-attention-grid">{items.map(([label, value]) => <Card key={label}><CardBody><strong className="financial-value">{value}</strong><span>{label}</span></CardBody></Card>)}</div></section>;
}

type ActivityItem = Pick<ExpenseTransactionDetails, "transaction" | "cardholder" | "merchant"> & { team?: ExpenseTransactionDetails["team"] };
export function ExpenseActivity({ items, heading = "Recent activity", includeTeam = true }: { items: ActivityItem[]; heading?: string; includeTeam?: boolean }) {
  if (!items.length) return <section aria-labelledby="expense-activity-heading"><div className="expenses-section-heading"><h2 id="expense-activity-heading">{heading}</h2></div><div className="empty-state"><h3>No recent transactions</h3><p>Card activity will appear here when it becomes available.</p></div></section>;
  return <section aria-labelledby="expense-activity-heading"><div className="expenses-section-heading"><h2 id="expense-activity-heading">{heading}</h2></div>
    <div className="expense-activity-table"><Table ariaLabel={heading}><TableHead><TableRow><TableHeaderCell>Merchant</TableHeaderCell><TableHeaderCell>Cardholder{includeTeam ? " / team" : ""}</TableHeaderCell><TableHeaderCell>Date</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell align="right">Amount</TableHeaderCell></TableRow></TableHead><TableBody>{items.map(({ transaction, cardholder, merchant, team }) => <TableRow key={transaction.id}><TableCell><strong>{merchant.name}</strong>{transaction.type === "refund" ? <small className="expense-cell-secondary">Refund</small> : null}</TableCell><TableCell>{cardholder.displayName}{includeTeam && team ? <small className="expense-cell-secondary">{team.name}</small> : null}</TableCell><TableCell>{formatDate(transaction.transactedAt)}</TableCell><TableCell><TransactionStatus status={transaction.status} /></TableCell><TableCell align="right"><strong className="financial-value">{transactionAmount(transaction.amountMinor, transaction.currency, transaction.type)}</strong></TableCell></TableRow>)}</TableBody></Table></div>
    <ol className="expense-activity-mobile" aria-label={heading}>{items.map(({ transaction, cardholder, merchant, team }) => <li key={transaction.id}><div><strong>{merchant.name}</strong><strong className="financial-value">{transactionAmount(transaction.amountMinor, transaction.currency, transaction.type)}</strong></div><p>{cardholder.displayName}{includeTeam && team ? ` · ${team.name}` : ""}</p><div><span>{formatDate(transaction.transactedAt)}</span><TransactionStatus status={transaction.status} /></div></li>)}</ol>
  </section>;
}

export function TeamFinancialSummary({ model }: { model: TeamModel }) {
  const { summary, team } = model; const currency = summary.budget?.currency ?? "GBP"; const over = (summary.remainingBudgetMinor ?? 0) < 0;
  return <section aria-labelledby="team-financial-heading"><div className="expenses-section-heading expenses-section-heading--compact"><h2 id="team-financial-heading">Monthly position</h2></div><Card className="team-financial-card"><CardBody><dl><div><dt>Monthly budget</dt><dd>{summary.budget ? formatMinorCurrencyAmount(summary.budget.amountMinor, currency) : "Not set"}</dd></div><div><dt>Settled expenditure</dt><dd>{formatMinorCurrencyAmount(summary.settledSpendingMinor, currency)}</dd></div><div><dt>{over ? "Over budget" : "Remaining budget"}</dt><dd className={over ? "expense-over-budget" : undefined}>{summary.remainingBudgetMinor === undefined ? "Not available" : formatMinorCurrencyAmount(Math.abs(summary.remainingBudgetMinor), currency)}</dd></div><div><dt>Budget utilisation</dt><dd>{summary.budgetUtilisationPercentage === undefined ? "Not available" : formatPercentage(summary.budgetUtilisationPercentage)}</dd></div></dl>{summary.budgetUtilisationPercentage !== undefined ? <BudgetBar utilisation={summary.budgetUtilisationPercentage} teamName={team.name} /> : null}</CardBody></Card></section>;
}

export function TeamCardholders({ model }: { model: TeamModel }) {
  if (!model.cardholders.length) return <section aria-labelledby="team-cardholders-heading"><div className="expenses-section-heading"><h2 id="team-cardholders-heading">Cardholders</h2></div><div className="empty-state"><h3>No relevant cardholders</h3><p>People with cards or spending attributed to this team will appear here.</p></div></section>;
  return <section aria-labelledby="team-cardholders-heading"><div className="expenses-section-heading"><h2 id="team-cardholders-heading">Cardholders</h2></div><div className="expense-responsive-table"><Table ariaLabel={`${model.team.name} cardholders`}><TableHead><TableRow><TableHeaderCell>Cardholder</TableHeaderCell><TableHeaderCell>Type</TableHeaderCell><TableHeaderCell align="right">Cards</TableHeaderCell><TableHeaderCell align="right">Team spending</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHead><TableBody>{model.cardholders.map((item) => <TableRow key={item.cardholder.id}><TableCell><strong>{item.cardholder.displayName}</strong>{item.primaryTeam.id !== model.team.id ? <small className="expense-cell-secondary">Primary team: {item.primaryTeam.name}</small> : null}</TableCell><TableCell>{item.cardholder.type === "external-contractor" ? "Contractor" : "Employee"}</TableCell><TableCell align="right">{item.attributedCards.length}</TableCell><TableCell align="right"><span className="financial-value">{formatMinorCurrencyAmount(item.settledSpendingMinor, "GBP")}</span></TableCell><TableCell><CardholderStatus status={item.cardholder.status} /></TableCell></TableRow>)}</TableBody></Table></div>
    <ol className="expense-detail-mobile" aria-label={`${model.team.name} cardholders`}>{model.cardholders.map((item) => <li key={item.cardholder.id}><div className="expense-detail-mobile__header"><div><strong>{item.cardholder.displayName}</strong><span>{item.cardholder.type === "external-contractor" ? "Contractor" : "Employee"}</span></div><strong className="financial-value">{formatMinorCurrencyAmount(item.settledSpendingMinor, "GBP")}</strong></div>{item.primaryTeam.id !== model.team.id ? <p>Primary team: {item.primaryTeam.name}</p> : null}<div className="expense-detail-mobile__footer"><span>{item.attributedCards.length} {item.attributedCards.length === 1 ? "card" : "cards"}</span><CardholderStatus status={item.cardholder.status} /></div></li>)}</ol>
  </section>;
}

function limitLabel(limit: TeamModel["cards"][number]["limit"]) {
  return `${formatMinorCurrencyAmount(limit.amountMinor, limit.currency)} ${limit.type === "per_transaction" ? "per transaction" : limit.type === "total" ? "total" : "monthly"}`;
}
export function TeamCards({ model }: { model: TeamModel }) {
  if (!model.cards.length) return <section aria-labelledby="team-cards-heading"><div className="expenses-section-heading"><h2 id="team-cards-heading">Cards</h2></div><div className="empty-state"><h3>No cards assigned</h3><p>Cards attributed to this team will appear here.</p></div></section>;
  return <section aria-labelledby="team-cards-heading"><div className="expenses-section-heading"><h2 id="team-cards-heading">Cards</h2></div><div className="expense-responsive-table"><Table ariaLabel={`${model.team.name} cards`}><TableHead><TableRow><TableHeaderCell>Card</TableHeaderCell><TableHeaderCell>Cardholder</TableHeaderCell><TableHeaderCell>Type</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Limit</TableHeaderCell><TableHeaderCell align="right">Used</TableHeaderCell></TableRow></TableHead><TableBody>{model.cards.map(({ card, cardholder, limit, utilisation }) => <TableRow key={card.id}><TableCell><strong>{capitaliseFirst(card.name)}</strong><small className="expense-cell-secondary">•••• {card.lastFour}</small></TableCell><TableCell>{cardholder.displayName}</TableCell><TableCell>{titleCase(card.type)}</TableCell><TableCell><CardStatus status={card.status} /></TableCell><TableCell>{limitLabel(limit)}</TableCell><TableCell align="right">{utilisation?.cumulative ? <span className="financial-value">{formatMinorCurrencyAmount(utilisation.spentMinor, limit.currency)}</span> : <span aria-label="Per-transaction limit does not have cumulative utilisation">Per purchase</span>}</TableCell></TableRow>)}</TableBody></Table></div>
    <ol className="expense-detail-mobile" aria-label={`${model.team.name} cards`}>{model.cards.map(({ card, cardholder, limit, utilisation }) => <li key={card.id}><div className="expense-detail-mobile__header"><div><strong>{capitaliseFirst(card.name)}</strong><span>{cardholder.displayName} · {titleCase(card.type)} · •••• {card.lastFour}</span></div><CardStatus status={card.status} /></div><dl><div><dt>Limit</dt><dd>{limitLabel(limit)}</dd></div><div><dt>Used</dt><dd>{utilisation?.cumulative ? formatMinorCurrencyAmount(utilisation.spentMinor, limit.currency) : <span aria-label="Per-transaction limit does not have cumulative utilisation">Per purchase</span>}</dd></div></dl></li>)}</ol>
  </section>;
}
