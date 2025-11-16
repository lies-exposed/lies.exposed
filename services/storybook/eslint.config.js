// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import reactConfig from "@liexp/core/lib/eslint/react.config.js";
import { defineConfig } from "eslint/config";
import storybook from "eslint-plugin-storybook";
import tseslint from "typescript-eslint";

export default defineConfig(
  ...reactConfig,
  storybook.configs["flat/recommended"],
  { ignores: ["build", "typings/*", "eslint.config.js"] },
  {
    files: [".storybook/*", "src/**/*"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["../*"],
        },
      ],
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off"
    },
  },
);
