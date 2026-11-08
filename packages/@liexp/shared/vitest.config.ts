import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "@liexp/shared",
    root: import.meta.dirname,
    fsModuleCache: true,
    globals: true,
    pool: "forks",
    isolate: false,
    maxWorkers: 3,
    include: [import.meta.dirname + "/src/**/*.spec.ts"],
    watch: false,
    coverage: {
      thresholds: {
        statements: 80,
        functions: 80,
      },
    },
    alias: {
      "@liexp/core/lib": path.resolve(import.meta.dirname, "../core/src"),
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  root: import.meta.dirname,
});
