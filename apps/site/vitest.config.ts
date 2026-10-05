import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
  },
  resolve: { alias: { "server-only": fileURLToPath(new URL("./test/server-only.ts", import.meta.url)) } },
});
