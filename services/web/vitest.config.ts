import { defineConfig } from "vite"

export default defineConfig({
  test: {
    projects: ["./vitest.config.*.ts"],
    watch: false,
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/**", "build/**", "test/**", "**/*.d.ts"],
    },
  },
});
