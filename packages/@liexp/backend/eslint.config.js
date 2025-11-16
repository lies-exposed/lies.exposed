import baseConfig from '@liexp/core/lib/eslint/base.config.js'
import { defineConfig } from 'eslint/config'
import tseslint from "typescript-eslint";

export default defineConfig(
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
);
