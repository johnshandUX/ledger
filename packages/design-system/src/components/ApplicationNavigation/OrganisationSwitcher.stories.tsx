import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  AppShell,
  AppWorkspace,
  OrganisationSwitcher,
  type OrganisationOption,
  SideNav,
  SideNavHeader,
  SideNavItem,
  SideNavNavigation,
  WorkspaceHeader,
} from "./ApplicationNavigation";

const caldermere = [
  { id: "caldermere", name: "Caldermere Ltd", secondaryLabel: "Administrator" },
] as const;
const multiple = [
  ...caldermere,
  { id: "northstar", name: "Northstar Industries", secondaryLabel: "Viewer" },
  { id: "cedar", name: "Cedar & Field Services", secondaryLabel: "Payment approver" },
] as const;

function Example({ defaultOpen = false, options = caldermere }: { defaultOpen?: boolean; options?: readonly OrganisationOption[] }) {
  const [selectedId, setSelectedId] = useState(options[0].id);
  return <div style={{ width: 248 }}><OrganisationSwitcher organisations={options} selectedId={selectedId} onSelectedIdChange={setSelectedId} defaultOpen={defaultOpen} addOrganisationAction={{ disabled: true }} /></div>;
}

function MobileExample() {
  return (
    <AppShell navigation={<SideNav><SideNavHeader><OrganisationSwitcher organisations={caldermere} selectedId="caldermere" /></SideNavHeader><SideNavNavigation><SideNavItem href="#accounts">Accounts</SideNavItem></SideNavNavigation></SideNav>}>
      <WorkspaceHeader>Accounts</WorkspaceHeader>
      <AppWorkspace>Mobile workspace</AppWorkspace>
    </AppShell>
  );
}

const meta = { title: "Patterns/Application Navigation/OrganisationSwitcher", component: OrganisationSwitcher, args: { organisations: caldermere, selectedId: "caldermere" }, parameters: { layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof OrganisationSwitcher>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SingleOrganisationSelected: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole("button", { name: "Switch organisation: Caldermere Ltd" });
    await userEvent.click(trigger);
    const surface = await body.findByRole("dialog", { name: "Switch organisation" });
    expect(within(surface).getByRole("radio", { name: /Caldermere Ltd/ })).toBeChecked();
    expect(within(surface).getByText("Current organisation")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Switch organisation" })).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const CurrentSelectionIsNoOp: Story = {
  args: { onSelectedIdChange: fn() },
  render: (args) => <div style={{ width: 248 }}><OrganisationSwitcher {...args} /></div>,
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole("button", { name: "Switch organisation: Caldermere Ltd" }));
    await userEvent.click(await body.findByRole("radio", { name: /Caldermere Ltd/ }));
    expect(args.onSelectedIdChange).not.toHaveBeenCalled();
  },
};
export const Expanded: Story = { render: () => <Example defaultOpen /> };
export const MultipleOrganisations: Story = {
  render: () => <Example options={multiple} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = body.getByRole("button", { name: "Switch organisation: Caldermere Ltd" });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("radio", { name: /Northstar Industries/ }));
    await waitFor(() => expect(trigger).toHaveAccessibleName("Switch organisation: Northstar Industries"));
  },
};
export const LongOrganisationName: Story = { render: () => <Example options={[{ id: "long", name: "The International Organisation for Complex Enterprise Operations" }]} /> };
export const MobilePopover: Story = {
  render: () => <MobileExample />,
  parameters: { layout: "fullscreen", viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole("button", { name: "Show navigation" }));
    const drawer = await body.findByRole("dialog", { name: "Application navigation" });
    const trigger = within(drawer).getByRole("button", { name: "Switch organisation: Caldermere Ltd" });
    await userEvent.click(trigger);
    expect(await body.findByRole("dialog", { name: "Switch organisation" })).toHaveAttribute("data-side", "bottom");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Switch organisation" })).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(within(drawer).getByRole("link", { name: "Accounts" }));
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Application navigation" })).not.toBeInTheDocument());
  },
};
export const LightAppearance: Story = { render: () => <Example defaultOpen />, globals: { theme: "light" } };
export const DarkAppearance: Story = { render: () => <Example defaultOpen />, globals: { theme: "dark" } };
