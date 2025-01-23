import viteTsconfigPaths from "vite-tsconfig-paths";
import { extendBaseConfig } from "./src/test/vitest.base-config";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  test: {
    name: "@liexp/backend",
    globals: true,
    include: [toAlias("src/**/*.spec.ts")],
    watch: false,
    coverage: {
      thresholds: {
        lines: 90,
        statements: 80,
        functions: 80,
      },
    },
  },
  plugins: [viteTsconfigPaths({ root: toAlias("./") })],
  root: toAlias("./"),
}));
