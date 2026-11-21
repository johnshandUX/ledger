export type BankNavigationRoute =
  | "accounts"
  | "payments"
  | "cashflow"
  | "expenses"
  | "tax"
  | "reports"
  | "treasury"
  | "cash-flow"
  | "fx"
  | "liquidity"
  | "forecasting"
  | "receivables"
  | "payables"
  | "integrations"
  | "admin";

type BankNavigationDestination = Readonly<{
  id: BankNavigationRoute;
  label: string;
  href: string;
}>;

type BankNavigationGroup = Readonly<{
  label?: string;
  destinations: readonly BankNavigationDestination[];
}>;

export const bankNavigation = [
  {
    label: undefined,
    destinations: [
      { id: "accounts", label: "Accounts", href: "/" },
      { id: "payments", label: "Payments", href: "/payments" },
    ],
  },
  {
    label: "Operations",
    destinations: [
      { id: "cashflow", label: "Cashflow", href: "/cashflow" },
      { id: "expenses", label: "Expenses", href: "/expenses" },
      { id: "tax", label: "Tax", href: "/tax" },
      { id: "reports", label: "Reports", href: "/reports" },
      { id: "treasury", label: "Treasury", href: "/treasury" },
    ],
  },
  {
    label: undefined,
    destinations: [
      { id: "integrations", label: "Integrations", href: "/integrations" },
      { id: "admin", label: "Admin", href: "/admin" },
    ],
  },
] as const satisfies readonly BankNavigationGroup[];

export const bankWorkspaceTitles: Record<BankNavigationRoute, string> = {
  accounts: "Accounts",
  payments: "Payments",
  cashflow: "Cashflow",
  expenses: "Expenses",
  tax: "Tax",
  reports: "Reports",
  treasury: "Treasury",
  "cash-flow": "Cash flow",
  fx: "FX",
  liquidity: "Liquidity",
  forecasting: "Forecasting",
  receivables: "Receivables",
  payables: "Payables",
  integrations: "Integrations",
  admin: "Admin",
};
