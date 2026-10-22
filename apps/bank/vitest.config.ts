import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@johnshandux/ledger-design-system/application-navigation",
        replacement: resolve(__dirname, "../../packages/design-system/src/application-navigation.ts"),
      },
      {
        find: "@johnshandux/ledger-synthetic-finance",
        replacement: resolve(__dirname, "../../packages/synthetic-finance/src/index.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/data-table",
        replacement: resolve(__dirname, "../../packages/design-system/src/data-table.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/appearance-toggle",
        replacement: resolve(__dirname, "../../packages/design-system/src/appearance-toggle.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/dialog",
        replacement: resolve(__dirname, "../../packages/design-system/src/dialog.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/popover",
        replacement: resolve(__dirname, "../../packages/design-system/src/popover.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/sheet",
        replacement: resolve(__dirname, "../../packages/design-system/src/sheet.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/dropdown-menu",
        replacement: resolve(__dirname, "../../packages/design-system/src/dropdown-menu.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system/icons",
        replacement: resolve(__dirname, "../../packages/design-system/src/icons.ts"),
      },
      {
        find: "@johnshandux/ledger-design-system",
        replacement: resolve(__dirname, "../../packages/design-system/src/index.ts"),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    setupFiles: [resolve(__dirname, "vitest.setup.ts")],
  },
});
