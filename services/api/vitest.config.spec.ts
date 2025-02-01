import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "api-spec",
    root: toAlias("./"),
    globals: true,
    include: [toAlias("./src/**/*.spec.ts")],
    exclude: ["**/build", "src/migrations", "src/scripts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.e2e.ts", "test"],
    }
  },
}));
