import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "io",
    root: __dirname,
    globals: true,
    include: [__dirname + "/src/**/*.spec.ts"],
    watch: false,
    coverage: {
      // Thresholds set at current coverage floored to nearest 5% (ratchet).
      // Actual: stmts 58.33%, branch 100%, funcs 37.50%, lines 65%
      thresholds: {
        statements: 55,
        branches: 95,
        functions: 35,
        lines: 65,
      },
    },
    alias: {
      "@liexp/core/lib": path.resolve(__dirname, "../core/src"),
    },
  },
  plugins: [viteTsconfigPaths({ root: __dirname })],
  root: __dirname,
});
