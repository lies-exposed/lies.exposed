import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    projects: ["vitest.config.e2e.ts", "vitest.config.spec.ts"],
  },
});
