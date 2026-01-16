import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["./vitest.config.*.ts"],
    reporters: ["verbose"],
    watch: false,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "build/**", "test/**", "**/*.d.ts"],
    },
  },
});
