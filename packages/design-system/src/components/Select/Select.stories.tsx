import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    label: "Account type",
    options: [
      { label: "Current account", value: "current" },
      { label: "Savings account", value: "savings" },
      { label: "Business account", value: "business" },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Choose an account type",
  },
};

export const WithHint: Story = {
  args: {
    hint: "Select the account that matches this relationship.",
    placeholder: "Choose an account type",
  },
};

export const Error: Story = {
  args: {
    error: "A valid account type is required.",
    placeholder: "Choose an account type",
  },
};
