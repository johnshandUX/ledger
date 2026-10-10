import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardBody, CardHeader } from "../Card/Card";
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
} from "./ApplicationNavigation";

type NavigationDestination = Readonly<{ id: string; label: string; href: string }>;
type NavigationGroup = Readonly<{ id: string; label?: string; destinations: readonly NavigationDestination[] }>;
type ProductExample = Readonly<{
  productName: string;
  pageTitle: string;
  activeDestinationId: string;
  groups: readonly NavigationGroup[];
  utility: readonly NavigationDestination[];
}>;

const bank: ProductExample = {
  productName: "Ledger Bank",
  pageTitle: "Accounts",
  activeDestinationId: "accounts",
  groups: [
    { id: "primary", destinations: [{ id: "accounts", label: "Accounts", href: "#bank-accounts" }, { id: "payments", label: "Payments", href: "#bank-payments" }, { id: "expenses", label: "Expenses", href: "#bank-expenses" }] },
    { id: "treasury", label: "Treasury", destinations: [{ id: "cash-flow", label: "Cash flow", href: "#bank-cash-flow" }, { id: "fx", label: "FX", href: "#bank-fx" }, { id: "liquidity", label: "Liquidity", href: "#bank-liquidity" }, { id: "forecasting", label: "Forecasting", href: "#bank-forecasting" }] },
    { id: "operations", label: "Operations", destinations: [{ id: "receivables", label: "Receivables", href: "#bank-receivables" }, { id: "payables", label: "Payables", href: "#bank-payables" }] },
    { id: "analysis", label: "Analysis", destinations: [{ id: "reports", label: "Reports", href: "#bank-reports" }, { id: "insights", label: "Insights", href: "#bank-insights" }] },
  ],
  utility: [{ id: "integrations", label: "Integrations", href: "#bank-integrations" }, { id: "admin", label: "Admin", href: "#bank-admin" }],
};

const accounting: ProductExample = {
  productName: "Ledger Accounting",
  pageTitle: "Dashboard",
  activeDestinationId: "dashboard",
  groups: [
    { id: "primary", destinations: [{ id: "dashboard", label: "Dashboard", href: "#accounting-dashboard" }, { id: "sales", label: "Sales", href: "#accounting-sales" }, { id: "purchases", label: "Purchases", href: "#accounting-purchases" }] },
    { id: "accounting", label: "Accounting", destinations: [{ id: "chart", label: "Chart of accounts", href: "#accounting-chart" }, { id: "journals", label: "Journals", href: "#accounting-journals" }, { id: "vat", label: "VAT", href: "#accounting-vat" }, { id: "reconciliation", label: "Reconciliation", href: "#accounting-reconciliation" }] },
    { id: "reporting", label: "Reporting", destinations: [{ id: "profit-loss", label: "Profit & loss", href: "#accounting-profit-loss" }, { id: "balance-sheet", label: "Balance sheet", href: "#accounting-balance-sheet" }, { id: "tax-reports", label: "Tax reports", href: "#accounting-tax-reports" }] },
  ],
  utility: [{ id: "integrations", label: "Integrations", href: "#accounting-integrations" }, { id: "admin", label: "Admin", href: "#accounting-admin" }],
};

function ConfiguredNavigation({ config }: { config: ProductExample }) {
  return (
    <SideNav>
      <SideNavHeader><strong>{config.productName}</strong></SideNavHeader>
      <SideNavContext><OrganisationSwitcher organisations={[{ id: "caldermere", name: "Caldermere Ltd" }]} selectedId="caldermere" /></SideNavContext>
      <SideNavNavigation>
        {config.groups.map((group) => (
          <SideNavGroup key={group.id} label={group.label}>
            {group.destinations.map((destination) => <SideNavItem key={destination.id} href={destination.href} current={destination.id === config.activeDestinationId}>{destination.label}</SideNavItem>)}
          </SideNavGroup>
        ))}
      </SideNavNavigation>
      <SideNavUtility>
        <nav aria-label="Utility">
          {config.utility.map((destination) => <SideNavItem key={destination.id} href={destination.href}>{destination.label}</SideNavItem>)}
        </nav>
      </SideNavUtility>
      <SideNavUser>
        <UserMenu displayName="John Shand" secondaryText="Administrator">
          <UserMenuItem>Personal preferences</UserMenuItem>
          <UserMenuItem>Sign out</UserMenuItem>
        </UserMenu>
      </SideNavUser>
    </SideNav>
  );
}

function ProductShellExample({ config, defaultOpen = true }: { config: ProductExample; defaultOpen?: boolean }) {
  return (
    <AppShell defaultNavigationOpen={defaultOpen} navigation={<ConfiguredNavigation config={config} />}>
      <WorkspaceHeader><h1 style={{ margin: 0, fontSize: "var(--ledger-font-size-heading-small)", lineHeight: "var(--ledger-line-height-heading-small)" }}>{config.pageTitle}</h1></WorkspaceHeader>
      <AppWorkspace>
        <Card>
          <CardHeader><h2 style={{ margin: 0, fontSize: "var(--ledger-font-size-heading-small)" }}>{config.productName} workspace</h2></CardHeader>
          <CardBody>This illustrative workspace validates that the shared navigation pattern can support a distinct product information architecture without changing its components.</CardBody>
        </Card>
      </AppWorkspace>
    </AppShell>
  );
}

const meta = {
  title: "Patterns/Application Navigation/Cross-product examples",
  component: AppShell,
  args: { navigation: null, children: null },
  parameters: { layout: "fullscreen", docs: { description: { component: "Two illustrative product configurations rendered through the same Application Navigation components. Product-specific destinations and groups are typed configuration; organisation, utility, user, and workspace regions remain composed." } } },
  tags: ["autodocs"],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LedgerBankOpen: Story = { render: () => <ProductShellExample config={bank} /> };
export const LedgerBankClosed: Story = { render: () => <ProductShellExample config={bank} defaultOpen={false} /> };
export const LedgerBankDark: Story = { render: () => <ProductShellExample config={bank} />, globals: { theme: "dark" } };
export const LedgerAccountingOpen: Story = { render: () => <ProductShellExample config={accounting} /> };
export const LedgerAccountingClosed: Story = { render: () => <ProductShellExample config={accounting} defaultOpen={false} /> };
export const LedgerAccountingDark: Story = { render: () => <ProductShellExample config={accounting} />, globals: { theme: "dark" } };
