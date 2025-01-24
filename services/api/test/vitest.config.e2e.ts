import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

const config = extendBaseConfig(import.meta.url, (toAlias) => ({
  test: {
    name: "api-e2e",
    root: toAlias("../"),
    globals: true,
    include: [toAlias(`../src/**/*.e2e.ts`)],
    setupFiles: [toAlias(`testSetup.ts`)],
    globalSetup: [toAlias(`globalSetup.ts`)],
    exclude: ["**/build", "**/src/migrations", "**/src/scripts"],
    pool: "forks",
    bail: 1,
    poolOptions: {
      forks: {
        singleFork: process.env.CI === "true" ? true : false,
        isolate: false,
      },
    },
  },
}));

export default config;
