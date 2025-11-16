import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  ...reactEslintConfig,
{
  files: ['src/**/*.tsx', 'src/**/*.ts'],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});
