import path from "path";
import { defineProject, mergeConfig } from "vitest/config";
import { baseConfig } from "../vitest.base-config";

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: "api-spec",
      root: path.join(__dirname, '../'),
      globals: true,
      include: [path.join(__dirname, "../src/**/*.spec.ts")],
      exclude: ["**/build", "**/src/migrations", "**/src/scripts"],
    },
  }),
);
