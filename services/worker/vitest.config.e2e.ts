import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "worker-e2e",
    root: toAlias("./"),
    globals: true,
    watch: false,
    include: [toAlias(`test/**/*.e2e.ts`)],
    setupFiles: [toAlias(`test/testSetup.ts`)],
    globalSetup: [toAlias(`test/globalSetup.ts`)],
    exclude: ["**/build"],
    pool: "forks",
    bail: 1,
    isolate: false,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["test/**/*.e2e.ts", "test"],
      // TODO: add coverage thresholds once the service can run tests without a
      // live database. Worker tests are all e2e and require a running DB.
    },
  },
  poolOptions: {
    forks: {
      singleFork: true,
      isolate: false,
    },
  },
}));
