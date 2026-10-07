import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkeletonExample } from "../../examples/componentExamples";
import { Skeleton } from "./Skeleton";

const meta = { title: "Components/Skeleton", component: Skeleton, tags: ["autodocs"], parameters: { layout: "centered" } } satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ContentPreview: Story = { render: () => <SkeletonExample /> };
export const TextLines: Story = { render: () => <div style={{ display: "grid", gap: 8, width: 320 }}><Skeleton /><Skeleton style={{ width: "70%" }} /></div> };
