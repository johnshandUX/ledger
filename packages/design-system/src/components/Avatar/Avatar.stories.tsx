import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { AvatarExample } from "../../examples/componentExamples";
import { Avatar } from "./Avatar";

const portrait = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23656b75'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%23f4f5f6'/%3E%3Cpath d='M16 96c3-24 16-36 32-36s29 12 32 36' fill='%23f4f5f6'/%3E%3C/svg%3E";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { src: portrait, alt: "Ada Lovelace", fallback: "AL" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {};
export const Sizes: Story = { render: () => <AvatarExample /> };
export const FailedImageFallback: Story = {
  args: { src: "/missing-avatar-image.png", alt: "Ada Lovelace", fallback: "AL" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("AL")).toBeVisible());
    await expect(canvas.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
  },
};
export const DelayedFallback: Story = {
  args: { src: "/missing-delayed-avatar-image.png", alt: "Grace Hopper", fallback: "GH", fallbackDelayMs: 300 },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(within(canvasElement).getByText("GH")).toBeVisible());
  },
};
