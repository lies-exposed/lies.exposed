import path from "path";
import { defineProject, mergeConfig } from "vitest/config";
import { baseConfig } from "../vitest.base-config";

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: "api-e2e",
      root: path.join(__dirname, "../"),
      globals: true,
      include: [path.join(__dirname, `../src/**/*.e2e.ts`)],
      setupFiles: [path.join(__dirname, `testSetup.ts`)],
      globalSetup: [path.join(__dirname, `globalSetup.ts`)],
      exclude: ["**/build", "**/src/migrations", "**/src/scripts"],
      threads: false,
      singleThread: true,
    },
  }),
);
