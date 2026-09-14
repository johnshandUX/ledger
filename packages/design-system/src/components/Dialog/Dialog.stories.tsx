import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Dialog presents a temporary, focused task or information while preserving the context of the underlying page.

**Anatomy:** Every Dialog requires a visible title. A description, body and footer actions are optional. When actions are present, place them in \`DialogFooter\`; secondary actions precede the primary action so the primary appears on the right. Use existing Ledger action components.

**Long content:** Put content in \`DialogBody\`. It becomes the scroll region when space is constrained, keeping footer actions available.

**Accessibility:** Radix manages focus trapping, Escape dismissal, accessible title and description relationships, and focus return. The close control is shown by default and has visible keyboard focus. Motion respects reduced-motion preferences.

**Use when:** A task or piece of information needs focused attention and can be completed without leaving the current page context.

**Do not use for:** Destructive confirmation, complex multi-step journeys, or tasks needing the space and context of a full page. Destructive confirmation belongs in the future Ledger AlertDialog.
        `.trim(),
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent title="Payment information">
        <DialogBody>
          The payment will remain pending until it has been authorised.
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View payment details</Button>
      </DialogTrigger>
      <DialogContent
        title="Payment details"
        description="Review the destination and amount before continuing."
      >
        <DialogBody>
          <p>£2,450.00 to Northwind Trading Ltd.</p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Review transfer</Button>
      </DialogTrigger>
      <DialogContent
        title="Submit transfer?"
        description="This will submit the transfer for processing."
      >
        <DialogBody>
          Confirm that the payment details are complete and accurate.
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Submit transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Read account terms</Button>
      </DialogTrigger>
      <DialogContent
        title="Account terms"
        description="Review the information before closing this dialog."
      >
        <DialogBody>
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index}>
              Section {index + 1}: Ledger will process authorised instructions in
              accordance with the account mandate and applicable cut-off times.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const InitiallyOpenFocusBehaviour: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Open focus example</Button>
      </DialogTrigger>
      <DialogContent
        title="Keyboard behaviour"
        description="Focus remains in this dialog until it is dismissed."
      >
        <DialogBody>Press Escape to close and return focus to the trigger.</DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const documentBody = within(canvasElement.ownerDocument.body);
    const dialog = await documentBody.findByRole("dialog");

    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(documentBody.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() =>
      expect(documentBody.getByRole("button", { name: "Open focus example" })).toHaveFocus(),
    );
  },
};
