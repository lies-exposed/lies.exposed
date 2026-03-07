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
      // Thresholds set at current coverage floored to nearest 5% (ratchet).
      // Actual: stmts 20.57%, branch 11.85%, funcs 12.26%, lines 20.88%
      // TODO: increase thresholds as more unit tests are added.
      thresholds: {
        lines: 50,
        statements: 50,
        functions: 50,
      },
    },
  },
}));
