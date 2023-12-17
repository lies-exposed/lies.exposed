import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: 'shared',
    root: __dirname,
    globals: true,
    include: [__dirname + "/src/**/*.spec.ts"],
    watch: false,
    coverage: {
      exclude: [`**/lib`],
      thresholds: {
        statements: 80,
        functions: 80
      }
    },
  },
  plugins: [viteTsconfigPaths()],
  root: __dirname,
});
