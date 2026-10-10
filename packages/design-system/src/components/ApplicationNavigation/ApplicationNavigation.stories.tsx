import { useState, type CSSProperties, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
  UserMenu,
  UserMenuItem,
  WorkspaceHeader,
} from "./ApplicationNavigation";

const organisations = [
  { id: "northstar", name: "Northstar Ltd" },
  { id: "atlas", name: "Atlas Manufacturing Group International" },
  { id: "cedar", name: "Cedar & Field Services" },
];

function OrganisationExample({ long = false, one = false }: { long?: boolean; one?: boolean }) {
  const options = one ? organisations.slice(0, 1) : organisations;
  const [selectedId, setSelectedId] = useState(long ? "atlas" : options[0].id);
  return <OrganisationSwitcher organisations={options} selectedId={selectedId} onSelectedIdChange={setSelectedId} />;
}

function Navigation({ overflow = false, restricted = false, longOrganisation = false, longUser = false }: { overflow?: boolean; restricted?: boolean; longOrganisation?: boolean; longUser?: boolean }) {
  return (
    <SideNav>
      <SideNavHeader><strong>Product workspace</strong></SideNavHeader>
      <SideNavContext><OrganisationExample long={longOrganisation} /></SideNavContext>
      <SideNavNavigation>
        <SideNavGroup label="Workspace">
          <SideNavItem href="#overview" current>Overview</SideNavItem>
          <SideNavItem href="#activity">Activity</SideNavItem>
          {!restricted ? <SideNavItem href="#reports">Reports</SideNavItem> : null}
        </SideNavGroup>
        {!restricted ? <SideNavGroup label="Planning"><SideNavItem href="#forecast">Forecasting</SideNavItem><SideNavItem href="#scenarios">Scenarios</SideNavItem></SideNavGroup> : null}
        {overflow ? Array.from({ length: 18 }, (_, index) => <SideNavItem key={index} href={`#destination-${index + 1}`}>Destination {index + 1}</SideNavItem>) : null}
      </SideNavNavigation>
      <SideNavUser>
        <UserMenu displayName={longUser ? "Alexandria Montgomery-Worthington" : "John Shand"} secondaryText={longUser ? "Senior application administrator" : "Administrator"}>
          <UserMenuItem>Personal preferences</UserMenuItem><UserMenuItem>Sign out</UserMenuItem>
        </UserMenu>
      </SideNavUser>
    </SideNav>
  );
}

function ShellExample({ defaultOpen = true, navigation, style }: { defaultOpen?: boolean; navigation?: ReactNode; style?: CSSProperties }) {
  return (
    <AppShell defaultNavigationOpen={defaultOpen} navigation={navigation ?? <Navigation />} style={style}>
      <WorkspaceHeader><h1 style={{ margin: 0, fontSize: "1.25rem" }}>Workspace overview</h1></WorkspaceHeader>
      <AppWorkspace><p style={{ margin: 0 }}>Product-owned workspace content appears here.</p></AppWorkspace>
    </AppShell>
  );
}

const meta = {
  title: "Patterns/Application Navigation/AppShell",
  component: AppShell,
  args: { navigation: null, children: null },
  parameters: { layout: "fullscreen", docs: { description: { component: "Structural application layout with fully open or closed inline navigation and a modal small-screen overlay. Products own routes, permissions, navigation labels, organisation data and user actions." } } },
  tags: ["autodocs"],
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NavigationOpen: Story = { render: () => <ShellExample />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: "Hide navigation" })); await waitFor(() => expect(canvas.getByRole("button", { name: "Show navigation" })).toBeVisible()); } };
export const NavigationClosed: Story = {
  render: () => <ShellExample defaultOpen={false} />,
  play: async ({ canvasElement }) => { const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: "Show navigation" }); await userEvent.click(trigger); await waitFor(() => expect(canvas.getByRole("navigation", { name: "Primary" })).toBeVisible()); },
};
export const ConstrainedViewport: Story = { render: () => <ShellExample style={{ maxWidth: 760 }} /> };
export const ResponsiveNavigationOverlay: Story = {
  render: () => <ShellExample defaultOpen={false} />,
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole("button", { name: "Show navigation" });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog", { name: "Application navigation" })).toBeVisible());
    await userEvent.click(body.getByRole("link", { name: "Activity" }));
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Application navigation" })).not.toBeInTheDocument());
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog", { name: "Application navigation" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Application navigation" })).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const OverflowingNavigation: Story = { render: () => <ShellExample navigation={<Navigation overflow />} /> };
export const RestrictedPermissions: Story = { render: () => <ShellExample navigation={<Navigation restricted />} /> };
export const LongOrganisationAndUser: Story = { render: () => <ShellExample navigation={<Navigation longOrganisation longUser />} /> };
export const LightAppearance: Story = { render: () => <ShellExample />, globals: { theme: "light" } };
export const DarkAppearance: Story = { render: () => <ShellExample />, globals: { theme: "dark" } };
