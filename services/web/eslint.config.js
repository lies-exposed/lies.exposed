import {reactConfig} from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  ...reactConfig,
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
