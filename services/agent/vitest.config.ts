import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "agent-e2e",
    root: toAlias("./"),
    globals: true,
    watch: false,
    include: [toAlias(`./src/**/*.e2e.ts`)],
    setupFiles: [toAlias(`test/testSetup.ts`)],
    exclude: ["**/build", "src/migrations", "src/scripts"],
    pool: "forks",
    bail: 1,
    isolate: false,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.e2e.ts", "test"],
    },
  },
  poolOptions: {
    forks: {
      singleFork: true,
      isolate: false,
    },
  },
}));
