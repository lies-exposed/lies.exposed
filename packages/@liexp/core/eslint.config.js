import { defineConfig } from 'eslint/config'
import baseConfig from './lib/eslint/base.config.js'
import tseslint from "typescript-eslint";

export default defineConfig(
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        // Use projectService for automatic TypeScript project detection
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "import-x/named": ["off"],
    },
  },
);
