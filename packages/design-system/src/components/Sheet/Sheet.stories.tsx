import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetTrigger } from "./Sheet";
const meta = { title: "Components/Sheet", component: Sheet, parameters: { layout: "centered", docs: { description: { component: "A modal supporting surface presented from the viewport edge. The underlying page remains visually present but is not interactive while open. A visible title is required; Radix manages focus, Escape dismissal, and focus return." } } }, tags: ["autodocs"] } satisfies Meta<typeof Sheet>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SupportingDetails: Story = {
  render: () => <Sheet><SheetTrigger asChild><Button variant="secondary">View account details</Button></SheetTrigger><SheetContent title="Account details" description="Information for the selected sterling account."><SheetBody>{Array.from({ length: 12 }, (_, index) => <p key={index}>Account detail {index + 1}</p>)}</SheetBody><SheetFooter><SheetClose asChild><Button>Done</Button></SheetClose></SheetFooter></SheetContent></Sheet>,
  play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: "View account details" }); await userEvent.click(trigger); const dialog = await body.findByRole("dialog", { name: "Account details" }); expect(dialog).toHaveAccessibleDescription("Information for the selected sterling account."); expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument()); expect(trigger).toHaveFocus(); },
};
export const FromLeft: Story = { render: () => <Sheet><SheetTrigger asChild><Button variant="secondary">Open supporting panel</Button></SheetTrigger><SheetContent side="left" title="Supporting information"><SheetBody>The page remains visually present behind this modal panel.</SheetBody></SheetContent></Sheet> };
