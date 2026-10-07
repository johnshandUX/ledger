import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatioExample } from "../../examples/componentExamples";
import { AspectRatio } from "./AspectRatio";

const meta = { title: "Components/AspectRatio", component: AspectRatio, tags: ["autodocs"], parameters: { layout: "centered" }, args: { ratio: 16 / 9, children: <span>Media</span> } } satisfies Meta<typeof AspectRatio>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Widescreen: Story = { render: () => <AspectRatioExample /> };
export const Square: Story = { args: { ratio: 1 }, render: ({ children: _children, ...args }) => <div style={{ width: 280 }}><AspectRatio {...args} className="ledger-example-media"><div><strong>1:1</strong><span>Square media region</span></div></AspectRatio></div> };
