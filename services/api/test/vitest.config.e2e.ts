import { defineProject, mergeConfig } from "vitest/config";
import { PathnameAlias, baseConfig } from "../vitest.base-config.js";

const toAlias = PathnameAlias(import.meta.url);

export default mergeConfig(
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
          singleThread: true,
        },
      },
    },
  }),
);
