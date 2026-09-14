import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "./AlertDialog";
const meta = { title: "Components/AlertDialog", component: AlertDialog, parameters: { layout: "centered", docs: { description: { component: "High-consequence confirmation with a required title and explicit cancel/action decision. Radix provides alertdialog semantics, focus management, outside-interaction protection, Escape dismissal, and focus return. Use Dialog for ordinary focused tasks." } } }, tags: ["autodocs"] } satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
const onCancel = fn();
const onDelete = fn();
export const DestructiveConfirmation: Story = {
  render: () => <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive">Delete beneficiary</Button></AlertDialogTrigger><AlertDialogContent title="Delete beneficiary?" description="This beneficiary will be removed and must be added again before another payment can be made." cancelAction={<Button variant="secondary" onClick={onCancel}>Cancel</Button>} action={<Button variant="destructive" onClick={onDelete}>Delete beneficiary</Button>} /></AlertDialog>,
  play: async ({ canvasElement }) => { const body = within(canvasElement.ownerDocument.body); const trigger = body.getByRole("button", { name: "Delete beneficiary" }); await userEvent.click(trigger); const alert = await body.findByRole("alertdialog", { name: "Delete beneficiary?" }); expect(alert).toHaveAccessibleDescription("This beneficiary will be removed and must be added again before another payment can be made."); expect(alert.contains(canvasElement.ownerDocument.activeElement)).toBe(true); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument()); expect(trigger).toHaveFocus(); await userEvent.click(trigger); await userEvent.click(await body.findByRole("button", { name: "Cancel" })); expect(onCancel).toHaveBeenCalledOnce(); expect(trigger).toHaveFocus(); await userEvent.click(trigger); await userEvent.click(await body.findByRole("button", { name: "Delete beneficiary" })); expect(onDelete).toHaveBeenCalledOnce(); },
};
