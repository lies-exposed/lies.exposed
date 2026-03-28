import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@liexp/test",
    globals: true,
    include: ["src/**/*.spec.ts"],
    watch: false,
    coverage: {
      include: ["src/**/*.ts"],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
