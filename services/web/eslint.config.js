import { reactConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(
  ...reactConfig,
{
  files: ['src/**/*.tsx', 'src/**/*.ts'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
