import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ insertTypesEntry: false })],
  build: {
    lib: {
      entry: resolve("src/dialog.ts"),
      name: "LedgerDesignSystemDialog",
      fileName: "dialog",
      formats: ["es", "cjs"],
    },
    outDir: resolve("dist"),
    emptyOutDir: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "cn",
        "radix-ui",
      ],
    },
  },
});
