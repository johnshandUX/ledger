import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/components/DataTable/*.{test,spec}.{ts,tsx}"],
  },
});
