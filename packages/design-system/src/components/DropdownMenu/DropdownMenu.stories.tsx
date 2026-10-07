import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./DropdownMenu";
const meta = { title: "Components/DropdownMenu", component: DropdownMenu, parameters: { layout: "centered", docs: { description: { component: "A compact keyboard-navigable action list. Put common actions first and destructive actions last, separated where helpful. Disabled items cannot be selected. Use Popover for mixed controls or content." } } }, tags: ["autodocs"] } satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AccountActions: Story = {
  render: () => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary">Account actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>View details</DropdownMenuItem><DropdownMenuItem>Download statement</DropdownMenuItem><DropdownMenuItem disabled>Close account</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem intent="destructive">Remove access</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
  play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: "Account actions" }); await userEvent.click(trigger); const menu = await body.findByRole("menu"); await waitFor(() => expect(menu).toBeVisible()); await waitFor(() => expect(menu).toHaveFocus()); expect(body.getByRole("menuitem", { name: "Close account" })).toHaveAttribute("data-disabled"); await userEvent.keyboard("{ArrowDown}"); await waitFor(() => expect(body.getByRole("menuitem", { name: "View details" })).toHaveFocus()); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument()); await waitFor(() => expect(trigger).toHaveFocus()); },
};
export const TextActionTrigger: Story = {
  render: () => <DropdownMenu><DropdownMenuTrigger asChild><button className="ledger-link" style={{ appearance: "none", border: 0, padding: 0, background: "transparent", cursor: "pointer" }} type="button">More account actions</button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>View details</DropdownMenuItem><DropdownMenuItem>Download statement</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
  play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: "More account actions" }); await userEvent.type(trigger, "{enter}"); await waitFor(() => expect(body.getByRole("menu")).toBeVisible()); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus()); },
};
