import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    label: "Account name",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter account name",
  },
};

export const WithHint: Story = {
  args: {
    hint: "Use the name shown on the account.",
    placeholder: "Enter account name",
  },
};

export const Error: Story = {
  args: {
    error: "Enter an account name.",
    placeholder: "Enter account name",
  },
};