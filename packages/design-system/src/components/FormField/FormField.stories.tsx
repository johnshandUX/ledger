import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import { Textarea } from "../Textarea/Textarea";

const meta = {
  title: "Patterns/FormField",
  component: FormField,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "420px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Account name",
    helperText: "Use the name shown on your account.",
    children: <Input label="Account name" placeholder="Enter account name" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: {
    required: true,
    children: <Input label="Account name" placeholder="Enter account name" />,
  },
};

export const Error: Story = {
  args: {
    error: "Enter an account name.",
    children: (
      <Input label="Account name" placeholder="Enter account name" value="" aria-invalid={true} />
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <Input label="Account name" placeholder="Enter account name" value="Savings account" readOnly />
    ),
  },
};

export const WithSelect: Story = {
  args: {
    label: "Country",
    helperText: "Choose the country where the account is registered.",
    children: (
      <Select
        label="Country"
        options={[
          { label: "United Kingdom", value: "uk" },
          { label: "France", value: "fr" },
          { label: "Belgium", value: "be" },
        ]}
        placeholder="Select a country"
      />
    ),
  },
};

export const WithTextarea: Story = {
  args: {
    label: "Purpose of account",
    helperText: "Give a short summary of the intended use.",
    children: <Textarea label="Purpose of account" placeholder="Describe the account purpose" />,
  },
};
