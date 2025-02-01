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
      thresholds: {
        statements: 80,
        functions: 80,
      },
    },
    alias: {
      "@liexp/core/lib": path.resolve(__dirname, "../core/src"),
    },
  },
  plugins: [viteTsconfigPaths({ root: __dirname })],
  root: __dirname,
});
