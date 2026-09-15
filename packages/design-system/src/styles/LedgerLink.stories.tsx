import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/Link styling",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const InBodyCopy: Story = {
  render: () => (
    <p>
      Review the <a className="ledger-link" href="#account-terms">account terms</a> before
      continuing.
    </p>
  ),
};

export const Standalone: Story = {
  render: () => (
    <a className="ledger-link" href="#all-accounts">
      View all accounts
    </a>
  ),
};
