import { defineProject, mergeConfig } from "vitest/config";
import { PathnameAlias, baseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

const toAlias = PathnameAlias(import.meta.url);

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: "api-spec",
      root: toAlias('../'),
      globals: true,
      include: [ toAlias('../src/**/*.spec.ts')],
      exclude: ["**/build", "**/src/migrations", "**/src/scripts"],
    },
  }),
);
