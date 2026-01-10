import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    projects: [
      "./packages/@liexp/*",
      "./services/web/vitest.config.e2e.ts",
      "./services/web/vitest.config.spec.ts",
      "./services/admin/vitest.config.e2e.ts",
      "./services/api/vitest.config.e2e.ts",
      "./services/api/vitest.config.spec.ts",
    ],
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "commitlint.config.js",
        "**/lib/**",
        "**/build/**",
        "**/@liexp/ui",
        "**/packages/@liexp/shared/src/tests",
        "**/services/api/src/migrations",
        "**/services/api/src/worker/index.ts",
        "**/services/api/src/routes/projects",
        "**/services/admin",
        "**/services/web",
        "**/services/data",
        "**/services/storybook",
        "temp/**",
        "**/test/**",
        "**/coverage/**",
        "**/vite.*.ts",
        "**/vitest.*.ts",
        "**/eslint.config.ts",
        "**/ormconfig.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
      },
    },
    alias: {
      "@liexp/core/lib/**": "./packages/@liexp/core/src/**",
      "@liexp/shared/lib/**": "./packages/@liexp/shared/src/**",
      "@liexp/backend/lib/**": "./packages/@liexp/backend/src/**",
    },
  },
});
