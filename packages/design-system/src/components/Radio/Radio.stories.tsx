import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio } from "./Radio";

const meta = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "Current account",
  },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    defaultChecked: true,
  },
};

export const WithHint: Story = {
  args: {
    hint: "Used for the primary ledger account.",
  },
};

export const VerticalGroup: Story = {
  render: () => (
    <div role="radiogroup" aria-label="Account type">
      <Radio name="account-type" value="current" label="Current account" defaultChecked />
      <Radio name="account-type" value="savings" label="Savings account" />
      <Radio name="account-type" value="deposit" label="Deposit account" />
    </div>
  ),
};

export const Error: Story = {
  args: {
    error: "Select an account type before continuing.",
  },
};
