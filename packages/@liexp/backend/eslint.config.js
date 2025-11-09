import baseConfig from '@liexp/core/lib/eslint/base.config.js'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
