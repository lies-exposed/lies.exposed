import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fsModuleCache: true,
    projects: ["./vitest.config.e2e.ts"],
    watch: false,
  },
});
