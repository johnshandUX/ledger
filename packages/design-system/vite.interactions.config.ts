import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: false })],
  build: {
    lib: {
      entry: {
        tooltip: resolve("src/tooltip.ts"),
        popover: resolve("src/popover.ts"),
        "dropdown-menu": resolve("src/dropdown-menu.ts"),
        "alert-dialog": resolve("src/alert-dialog.ts"),
        sheet: resolve("src/sheet.ts"),
      },
      formats: ["es", "cjs"],
      cssFileName: "interactions",
    },
    outDir: resolve("dist"),
    emptyOutDir: false,
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "cn", "radix-ui"] },
  },
});
