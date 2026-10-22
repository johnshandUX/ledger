import {
  AppShell,
  AppWorkspace,
  OrganisationSwitcher,
  SideNav,
  SideNavContext,
  SideNavGroup,
  SideNavHeader,
  SideNavItem,
  SideNavNavigation,
  SideNavUser,
  SideNavUtility,
  UserMenu,
  UserMenuItem,
  WorkspaceHeader,
} from "@johnshandux/ledger-design-system/application-navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { BANK_BUSINESS_ID, BANK_BUSINESS_NAME } from "../src/finance/environment";
import { getBankDemoUser, getBankRolesForUser } from "../src/finance/users";
import { ThemeControl } from "./ThemeControl";
import "./ProductShell.css";

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

type ProductShellProps = {
  activeRoute: BankNavigationRoute;
  children: ReactNode;
};

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
      { id: "fx", label: "FX", href: "/treasury/fx" },
      { id: "liquidity", label: "Liquidity", href: "/treasury/liquidity" },
      { id: "forecasting", label: "Forecasting", href: "/treasury/forecasting" },
    ],
  },
  {
    label: "Operations",
    destinations: [
      { id: "receivables", label: "Receivables", href: "/operations/receivables" },
      { id: "payables", label: "Payables", href: "/operations/payables" },
    ],
  },
] as const satisfies readonly BankNavigationGroup[];

export const bankUtilityNavigation = [
  { id: "integrations", label: "Integrations", href: "/integrations" },
  { id: "admin", label: "Admin", href: "/admin" },
] as const satisfies readonly BankNavigationDestination[];

const workspaceTitles: Record<BankNavigationRoute, string> = {
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

export function ProductShell({ activeRoute, children }: ProductShellProps) {
  const activeUser = getBankDemoUser();
  const activeRole = getBankRolesForUser(activeUser.id)[0];
  const displayName = `${activeUser.firstName} ${activeUser.lastName}`;

  const navigation = (
    <SideNav>
      <SideNavHeader>
        <Link href="/" className="bank-product-name">Ledger Bank</Link>
      </SideNavHeader>
      <SideNavContext>
        <OrganisationSwitcher
          organisations={[{ id: BANK_BUSINESS_ID, name: BANK_BUSINESS_NAME }]}
          selectedId={BANK_BUSINESS_ID}
        />
      </SideNavContext>
      <SideNavNavigation label="Primary">
        {bankNavigation.map((group) => (
          <SideNavGroup key={group.label ?? "primary"} label={group.label}>
            {group.destinations.map((route) => (
              <SideNavItem key={route.id} asChild current={activeRoute === route.id}>
                <Link href={route.href}>{route.label}</Link>
              </SideNavItem>
            ))}
          </SideNavGroup>
        ))}
      </SideNavNavigation>
      <SideNavUtility>
        <nav className="bank-navigation-utility-links" aria-label="Utility">
          {bankUtilityNavigation.map((route) => (
            <SideNavItem key={route.id} asChild current={activeRoute === route.id}>
              <Link href={route.href}>{route.label}</Link>
            </SideNavItem>
          ))}
        </nav>
        <div className="bank-navigation-appearance">
          <span>Appearance</span>
          <ThemeControl />
        </div>
      </SideNavUtility>
      <SideNavUser>
        <UserMenu displayName={displayName} secondaryText={activeRole?.name}>
          <UserMenuItem disabled>Personal preferences</UserMenuItem>
          <UserMenuItem disabled>Sign out</UserMenuItem>
        </UserMenu>
      </SideNavUser>
    </SideNav>
  );

  return (
    <AppShell className="product-shell" navigation={navigation}>
      <WorkspaceHeader className="bank-workspace-header">
        <span className="bank-workspace-title">{workspaceTitles[activeRoute]}</span>
      </WorkspaceHeader>
      <AppWorkspace className="bank-workspace">{children}</AppWorkspace>
    </AppShell>
  );
}
