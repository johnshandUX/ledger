import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ErrorIcon,
  InformationIcon,
  SuccessIcon,
  WarningIcon,
} from "./Icon";
import type { IconSize } from "./Icon";

const sizes: IconSize[] = ["small", "medium", "large"];

const statusIcons = [
  { label: "Information", Icon: InformationIcon },
  { label: "Success", Icon: SuccessIcon },
  { label: "Warning", Icon: WarningIcon },
  { label: "Error", Icon: ErrorIcon },
];

const meta = {
  title: "Components/Icon",
  component: InformationIcon,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  args: {
    size: "medium",
  },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ledger-space-5)", color: "var(--ledger-color-text)" }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: "var(--ledger-space-4)" }}>
          {statusIcons.map(({ label, Icon }) => (
            <div
              key={`${label}-${size}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--ledger-space-2)",
                minWidth: "120px",
              }}
            >
              <Icon {...args} size={size} aria-label={`${label} icon`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
} satisfies Meta<typeof InformationIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Statuses: Story = {};
