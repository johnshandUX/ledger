export type BankNavigationRoute =
  | "accounts"
  | "payments"
  | "expenses"
  | "reports"
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
      { id: "expenses", label: "Expenses", href: "/expenses" },
      { id: "reports", label: "Reports", href: "/reports" },
    ],
  },
  {
    label: "Treasury",
    destinations: [
      { id: "cash-flow", label: "Cash flow", href: "/treasury/cash-flow" },
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
  expenses: "Expenses",
  reports: "Reports",
  "cash-flow": "Cash flow",
  fx: "FX",
  liquidity: "Liquidity",
  forecasting: "Forecasting",
  receivables: "Receivables",
  payables: "Payables",
  integrations: "Integrations",
  admin: "Admin",
};
