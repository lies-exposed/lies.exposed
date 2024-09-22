import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    globals: true,
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        "commitlint.config.js",
        "ecosystem.config.js",
        "ecosystem.dev.config.js",
        "**/lib/**",
        "**/build/**",
        "**/@liexp/ui",
        "**/services/api/src/migrations",
        "**/services/api/src/worker/index.ts",
        "**/services/api/src/routes/projects",
        "**/services/admin-web",
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
      }
    }
  }
})