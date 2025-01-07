import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";
import { baseConfig } from "./src/test/vitest.base-config";

export default mergeConfig(baseConfig, defineConfig({
  test: {
    name: "@liexp/backend",
    root: __dirname,
    globals: true,
    include: [__dirname + "/src/**/*.spec.ts"],
    watch: false,
    coverage: {
      thresholds: {
        lines: 90,
        statements: 80,
        functions: 80,
      },
    },
  },
  plugins: [viteTsconfigPaths({ root: __dirname })],
  root: __dirname,
}));
