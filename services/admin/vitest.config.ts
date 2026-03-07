import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./vitest.config.e2e.ts", "./vitest.config.spec.ts"],
    reporters: ["verbose"],
    watch: false,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "build/**",
        "test/**",
        "**/*.d.ts",
      ],
    },
  },
});