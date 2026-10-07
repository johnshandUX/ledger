import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpinnerExample } from "../../examples/componentExamples";
import { Spinner } from "./Spinner";

const meta = { title: "Components/Spinner", component: Spinner, tags: ["autodocs"], parameters: { layout: "centered" }, args: { label: "Loading" } } satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Medium: Story = {};
export const Sizes: Story = { render: () => <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Spinner size="small" label="Loading small item" /><Spinner label="Loading item" /><Spinner size="large" label="Loading large item" /></div> };
export const WithVisibleText: Story = { render: () => <SpinnerExample /> };
