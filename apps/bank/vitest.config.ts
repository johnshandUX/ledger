import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: [
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
        find: "@johnshandux/ledger-design-system",
        replacement: resolve(__dirname, "../../packages/design-system/src/index.ts"),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
  },
});
