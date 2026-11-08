import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@liexp/ui",
    root: import.meta.dirname,
    globals: true,
    pool: "forks",
    watch: false,
    environment: "jsdom",
    setupFiles: [path.join(import.meta.dirname, "test.setup.ts")],
    include: [path.join(import.meta.dirname, "/src/**/*.spec.{ts,tsx}")],
    coverage: {
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  root: import.meta.dirname,
});
