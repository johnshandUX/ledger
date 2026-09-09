import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: false })],
  build: {
    lib: {
      entry: resolve("src/icons.ts"),
      name: "LedgerDesignSystemIcons",
      fileName: "icons",
      formats: ["es", "cjs"],
    },
    outDir: resolve("dist"),
    emptyOutDir: false,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
  },
});
