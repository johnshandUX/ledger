import type { Meta, StoryObj } from "@storybook/react-vite";
import { SeparatorExample, SeparatorOrientationExample } from "../../examples/componentExamples";
import { Separator } from "./Separator";

const meta = { title: "Components/Separator", component: Separator, tags: ["autodocs"], parameters: { layout: "centered" } } satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Horizontal: Story = { render: () => <div style={{ width: 320 }}><SeparatorExample /></div> };
export const Orientations: Story = { render: () => <SeparatorOrientationExample /> };
export const Semantic: Story = { args: { decorative: false }, render: (args) => <div style={{ width: 320 }}><Separator {...args} /></div> };
