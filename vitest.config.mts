import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDirectory,
      "server-only": fileURLToPath(new URL("./app/shared/test/server-only.ts", import.meta.url)),
    },
  },
  test: {
    allowOnly: false,
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
