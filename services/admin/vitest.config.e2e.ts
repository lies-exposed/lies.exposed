import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  test: {
    name: "e2e",
    globals: true,
    watch: false,
    environment: "node",
    // Must use forks (child process), not vmForks (V8 VM context):
    // Vite's dev server uses rolldown native bindings that do instanceof checks
    // which fail when objects cross V8 VM realm boundaries.
    pool: "forks",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: [toAlias("test/testSetup.ts")],
    include: [toAlias("test/**/*.e2e.test.ts")],
    exclude: ["node_modules/**", "build/**"],
    root: toAlias("./"),
    env: {
      NODE_ENV: "test",
    },
    sequence: { groupOrder: 2 },
  },
  poolOptions: {
    forks: {
      singleFork: true,
      isolate: false,
    },
  },
}));
