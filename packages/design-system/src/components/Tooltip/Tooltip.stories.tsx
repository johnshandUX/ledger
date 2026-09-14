import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

const meta = { title: "Components/Tooltip", component: Tooltip, parameters: { layout: "centered", docs: { description: { component: "Brief, non-essential supplementary information for an existing element. It opens on hover or keyboard focus and dismisses on Escape. Keep content concise; use visible hint or validation text for information required to complete a task." } } }, tags: ["autodocs"] } satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Basic: Story = { args: { content: "Copies the account number", children: <Button variant="secondary">Copy</Button> }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body); await userEvent.tab(); const trigger = canvas.getByRole("button", { name: "Copy" }); expect(trigger).toHaveFocus(); const tooltip = await body.findByRole("tooltip"); expect(tooltip).toBeVisible(); expect(trigger).toHaveAttribute("aria-describedby", tooltip.id); await userEvent.keyboard("{Escape}"); await waitFor(() => expect(body.queryByRole("tooltip")).not.toBeInTheDocument()); } };
