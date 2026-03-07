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
      // Thresholds set at current coverage floored to nearest 5% (ratchet).
      // Only one spec file exists (useStreamingChat.spec.ts).
      // TODO: increase thresholds as more unit tests are added.
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
}));
