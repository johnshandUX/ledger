import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    label: "Notes",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Add context for the account",
  },
};

export const WithHint: Story = {
  args: {
    hint: "This will be shown to internal account teams.",
    placeholder: "Add context for the account",
  },
};

export const Error: Story = {
  args: {
    error: "A note is required for this workflow.",
    placeholder: "Add context for the account",
  },
};
