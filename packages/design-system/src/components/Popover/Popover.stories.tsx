import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./Popover";
const meta = { title: "Components/Popover", component: Popover, parameters: { layout: "centered", docs: { description: { component: "Contextual interactive content anchored to a trigger. Radix manages dismissal and focus return. Use Tooltip for non-interactive supplementary text, DropdownMenu for action lists, and Dialog or Sheet for larger tasks." } } }, tags: ["autodocs"] } satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DisplayPreference: Story = {
  render: () => <Popover><PopoverTrigger asChild><Button variant="secondary">Display density</Button></PopoverTrigger><PopoverContent><p>Choose how much transaction detail is shown.</p><PopoverClose asChild><Button>Use compact view</Button></PopoverClose></PopoverContent></Popover>,
  play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: "Display density" }); await userEvent.click(trigger); expect(await body.findByText("Choose how much transaction detail is shown.")).toBeVisible(); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(body.queryByText("Choose how much transaction detail is shown.")).not.toBeInTheDocument()); expect(trigger).toHaveFocus(); },
};
