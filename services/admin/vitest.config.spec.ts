import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "admin-spec",
    root: toAlias("./"),
    globals: true,
    watch: false,
    environment: "jsdom",
    include: [toAlias("./src/**/*.spec.ts"), toAlias("./src/**/*.spec.tsx")],
    exclude: ["node_modules/**", "build/**", "**/*.e2e.*"],
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.e2e.*", "test/**", "node_modules/**", "build/**"],
      // Only one spec file exists (useStreamingChat.spec.ts); coverage is minimal.
      // TODO: add more unit tests and raise thresholds to 80%.
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
}));
