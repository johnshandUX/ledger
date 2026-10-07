import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "I agree to the terms",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const WithHint: Story = {
  args: {
    hint: "This helps us process your application securely.",
  },
};

export const VerticalGroup: Story = {
  render: () => (
    <div role="group" aria-label="Statement delivery preferences">
      <Checkbox name="delivery" label="Email statements" defaultChecked />
      <Checkbox name="delivery" label="Paper statements" />
      <Checkbox name="delivery" label="Monthly account summary" />
    </div>
  ),
};

export const Error: Story = {
  args: {
    error: "You must agree before continuing.",
  },
};
