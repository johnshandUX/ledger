import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppearanceToggle, type LedgerAppearance } from "./AppearanceToggle";

const meta = {
  title: "Components/AppearanceToggle",
  component: AppearanceToggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A compact controlled toggle for switching between effective light and dark appearance. Applications own system preference detection and runtime preference state.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppearanceToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: { appearance: "light", onAppearanceChange: () => undefined },
  render: function InteractiveStory() {
    const [appearance, setAppearance] = useState<LedgerAppearance>("light");
    return <AppearanceToggle appearance={appearance} onAppearanceChange={setAppearance} />;
  },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", { name: "Dark appearance" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};
