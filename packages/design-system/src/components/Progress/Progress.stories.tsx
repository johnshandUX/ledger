import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ProgressExample } from "../../examples/componentExamples";
import { Progress } from "./Progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "Uploading statement", value: 40 },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {
  render: (args) => <div className="ledger-example-progress"><span>Uploading statement</span><strong>{args.value}%</strong><Progress {...args} /></div>,
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar", { name: "Uploading statement" });
    await expect(progressbar).toHaveAttribute("aria-valuenow", "40");
  },
};

export const Indeterminate: Story = {
  args: { label: "Connecting to bank", value: null },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar", { name: "Connecting to bank" });
    await expect(progressbar).not.toHaveAttribute("aria-valuenow");
  },
};

export const InContext: Story = { render: () => <ProgressExample /> };
