import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./DropdownMenu";
const meta = { title: "Components/DropdownMenu", component: DropdownMenu, parameters: { layout: "centered", docs: { description: { component: "A compact keyboard-navigable action list. Put common actions first and destructive actions last, separated where helpful. Disabled items cannot be selected. Use Popover for mixed controls or content." } } }, tags: ["autodocs"] } satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AccountActions: Story = {
  render: () => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary">Account actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>View details</DropdownMenuItem><DropdownMenuItem>Download statement</DropdownMenuItem><DropdownMenuItem disabled>Close account</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem intent="destructive">Remove access</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
  play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: "Account actions" }); await userEvent.click(trigger); const menu = await body.findByRole("menu"); expect(menu).toBeVisible(); expect(body.getByRole("menuitem", { name: "Close account" })).toHaveAttribute("data-disabled"); await userEvent.keyboard("{ArrowDown}"); expect(body.getByRole("menuitem", { name: "Download statement" })).toHaveFocus(); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument()); expect(trigger).toHaveFocus(); },
};
