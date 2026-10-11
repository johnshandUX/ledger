import type { BankNavigationRoute } from "./ProductShell";
import { ProductShell } from "./ProductShell";
import "./planned-feature.css";

export type PlannedFeature = Readonly<{
  route: BankNavigationRoute;
  name: string;
  summary: string;
  detail: string;
}>;

export const plannedFeatures = {
  expenses: {
    route: "expenses",
    name: "Expenses",
    summary: "Manage business spending and employee expenses.",
    detail: "Review expenses, supporting records and reimbursement activity.",
  },
  reports: {
    route: "reports",
    name: "Reports",
    summary: "Access financial information for routine banking work.",
    detail: "Generate statements and export account and transaction data.",
  },
  cashFlow: {
    route: "cash-flow",
    name: "Cash flow",
    summary: "Understand how money moves through your business.",
    detail: "Review cash movements and upcoming changes across your accounts.",
  },
  fx: {
    route: "fx",
    name: "FX",
    summary: "Manage your business currency requirements.",
    detail: "Review exchange activity and prepare foreign currency transactions.",
  },
  liquidity: {
    route: "liquidity",
    name: "Liquidity",
    summary: "Monitor funds available across your organisation.",
    detail: "Review liquidity positions and how balances are distributed.",
  },
  forecasting: {
    route: "forecasting",
    name: "Forecasting",
    summary: "Plan for expected changes in cash position.",
    detail: "Review projected inflows, outflows and account balances.",
  },
  receivables: {
    route: "receivables",
    name: "Receivables",
    summary: "Manage money owed to your business.",
    detail: "Track invoices, incoming payments and overdue balances.",
  },
  payables: {
    route: "payables",
    name: "Payables",
    summary: "Manage money your business owes.",
    detail: "Review supplier obligations, due dates and outgoing payments.",
  },
  integrations: {
    route: "integrations",
    name: "Integrations",
    summary: "Connect Ledger Bank with your business systems.",
    detail: "Review and manage connections with supported finance tools.",
  },
  admin: {
    route: "admin",
    name: "Admin",
    summary: "Manage Ledger Bank settings for your organisation.",
    detail: "Review administrative settings, access and organisation details.",
  },
} as const satisfies Record<string, PlannedFeature>;

export function PlannedFeaturePage({ feature }: { feature: PlannedFeature }) {
  return (
    <ProductShell activeRoute={feature.route}>
      <div className="planned-feature-page">
        <section className="planned-feature-panel" aria-labelledby="planned-feature-title">
          <p className="planned-feature-status">Planned feature</p>
          <h1 id="planned-feature-title">{feature.name}</h1>
          <p className="planned-feature-summary">{feature.summary}</p>
          <p className="planned-feature-detail">{feature.detail}</p>
          <p className="planned-feature-notice">
            {feature.name} is planned for a future Ledger release.
          </p>
        </section>
      </div>
    </ProductShell>
  );
}
