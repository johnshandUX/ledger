import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeExample } from "../../examples/componentExamples";
import { Badge } from "./Badge";
const meta = { title: "Components/Badge", component: Badge, tags: ["autodocs"], parameters: { layout: "centered" }, args: { children: "Pending", variant: "neutral" } } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Neutral: Story = {};
export const Statuses: Story = { render: () => <BadgeExample /> };
