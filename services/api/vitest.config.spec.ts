import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "api-spec",
    root: toAlias("./"),
    globals: true,
    watch: false,
    include: [toAlias("./src/**/*.spec.ts")],
    exclude: ["**/build", "src/migrations", "src/scripts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.e2e.ts", "test"],
      // TODO: add coverage thresholds once the service can run tests without a
      // live database. Currently most tests require a DB connection and are
      // exercised via e2e rather than unit tests.
    }
  },
}));
