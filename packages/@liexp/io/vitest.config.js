import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "io",
    root: __dirname,
    globals: true,
    pool: "vmForks",
    include: [__dirname + "/src/**/*.spec.ts"],
    watch: false,
    coverage: {
      thresholds: {
        statements: 80,
        functions: 80,
      },
    },
    alias: {
      "@liexp/core/lib": path.resolve(__dirname, "../core/src"),
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  root: __dirname,
});
