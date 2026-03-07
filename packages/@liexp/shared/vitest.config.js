import path from "path";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "shared",
    root: __dirname,
    globals: true,
    include: [__dirname + "/src/**/*.spec.ts"],
    watch: false,
    coverage: {
      // Thresholds set at current coverage floored to nearest 5% (ratchet).
      // Actual: stmts 63.90%, branch 58.92%, funcs 56.84%, lines 63.53%
      thresholds: {
        statements: 60,
        branches: 55,
        functions: 55,
        lines: 60,
      },
    },
    alias: {
      "@liexp/core/lib": path.resolve(__dirname, "../core/src"),
    },
  },
  plugins: [viteTsconfigPaths({ root: __dirname })],
  root: __dirname,
});
