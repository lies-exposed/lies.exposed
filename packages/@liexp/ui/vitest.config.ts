import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "ui",
    root: __dirname,
    globals: true,
    watch: false,
    environment: "jsdom",
    setupFiles: [path.join(__dirname, "test.setup.ts")],
    include: [path.join(__dirname, "/src/**/*.spec.{ts,tsx}")],
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
  root: __dirname,
});
