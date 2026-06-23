import { baseConfig } from '@liexp/eslint-config'
import { defineConfig } from 'eslint/config'
import tseslint from "typescript-eslint";

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
