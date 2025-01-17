import { extendBaseConfig } from "./src/test/vitest.base-config";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  test: {
    name: "@liexp/backend",
    globals: true,
    include: [toAlias("src/**/*.spec.ts")],
    watch: false,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/test"],
      thresholds: {
        lines: 90,
        statements: 80,
        functions: 80,
      },
    },
  },
}));
