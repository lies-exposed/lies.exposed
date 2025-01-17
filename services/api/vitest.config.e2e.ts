import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

const config = extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "api-e2e",
    root: toAlias("./"),
    globals: true,
    include: [toAlias(`./src/**/*.e2e.ts`)],
    setupFiles: [toAlias(`test/testSetup.ts`)],
    globalSetup: [toAlias(`test/globalSetup.ts`)],
    exclude: ["**/build", "src/migrations", "src/scripts"],
    pool: "forks",
    bail: 1,
    poolOptions: {
      forks: {
        singleFork: process.env.CI === "true" ? true : false,
        isolate: false,
      },
    },
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.e2e.ts", "test"],
    }
  },
}));

export default config;
