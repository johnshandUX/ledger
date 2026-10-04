import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: false,
      include: ["src"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.*"],
    }),
  ],
  build: {
    lib: {
      entry: {
        "ledger-design-system": resolve("src/index.ts"),
        icons: resolve("src/icons.ts"),
        dialog: resolve("src/dialog.ts"),
        tooltip: resolve("src/tooltip.ts"),
        popover: resolve("src/popover.ts"),
        "dropdown-menu": resolve("src/dropdown-menu.ts"),
        "alert-dialog": resolve("src/alert-dialog.ts"),
        sheet: resolve("src/sheet.ts"),
        "appearance-toggle": resolve("src/appearance-toggle.ts"),
        "data-table": resolve("src/data-table.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => format === "es" ? `${entryName}.js` : entryName === "ledger-design-system" ? "ledger-design-system.umd.cjs" : `${entryName}.cjs`,
      cssFileName: "ledger-design-system",
    },
    // One build owns and emits the complete public package, so stale outputs can be removed safely.
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "cn",
        "radix-ui",
      ]
    },
  },
});
