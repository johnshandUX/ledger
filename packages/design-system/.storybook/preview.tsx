/// <reference types="vite/client" />

import "../src/styles/index.css";

import { useEffect, type ReactNode } from "react";
import type { Preview } from "@storybook/react-vite";

type ThemePreference = "system" | "light" | "dark";

function ThemeDecorator({ theme, children }: { theme: ThemePreference; children: ReactNode }) {
  useEffect(() => {
    if (theme === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }

    return () => delete document.documentElement.dataset.theme;
  }, [theme]);

  return children;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Ledger appearance",
      defaultValue: "system",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeDecorator theme={context.globals.theme as ThemePreference}>
        <Story />
      </ThemeDecorator>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
