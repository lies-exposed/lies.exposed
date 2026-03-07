import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "agent-spec",
    root: toAlias("./"),
    globals: true,
    watch: false,
    setupFiles: [toAlias("./test/specSetup.ts")],
    include: [toAlias("./src/**/*.spec.ts"), toAlias("./src/**/*.test.ts")],
    exclude: ["**/build", "src/migrations", "src/scripts"],
    env: {
      NODE_ENV: "test",
      DEBUG: "-",
      SERVER_HOST: "localhost",
      SERVER_PORT: "4000",
      JWT_SECRET: "test-secret",
      API_BASE_URL: "http://localhost:4010",
      API_TOKEN: "test-token",
      BRAVE_API_KEY: "null",
    },
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.e2e.ts", "test"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
}));
