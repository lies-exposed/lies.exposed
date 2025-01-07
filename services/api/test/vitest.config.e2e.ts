import { defineProject, mergeConfig } from "vitest/config";
import { PathnameAlias, baseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

const toAlias = PathnameAlias(import.meta.url);

const config = mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: "api-e2e",
      root: toAlias("../"),
      globals: true,
      include: [toAlias(`../src/**/*.e2e.ts`)],
      setupFiles: [toAlias(`testSetup.ts`)],
      globalSetup: [toAlias(`globalSetup.ts`)],
      exclude: ["**/build", "**/src/migrations", "**/src/scripts"],
      pool: "threads",
      poolOptions: {
        threads: {
          singleThread: process.env.CI ? true : false,
          isolate: process.env.CI ? true : false,
        },
      },
    },
  }),
);

export default config;