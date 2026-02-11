import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  test: {
    name: "web-e2e",
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: [toAlias("test/testSetup.ts")],
    include: [toAlias("test/**/*.e2e.test.ts")],
    exclude: ["node_modules/**", "build/**"],
    root: toAlias("./"),
    env: {
      NODE_ENV: "test",
    },
  },
  esbuild: {
    target: "node18",
  },
}));
