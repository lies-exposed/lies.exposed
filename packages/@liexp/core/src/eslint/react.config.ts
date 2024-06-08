import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint, { Config } from "typescript-eslint";
import baseConfig from "./base.config.js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig: Config = tseslint.config(
  ...baseConfig,
  ...compat.extends("plugin:react/recommended"),
  ...compat.plugins("@tanstack/eslint-plugin-query", "react"),
  {
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/prop-types": ["off"],
      "@typescript-eslint/no-unnecessary-type-assertion": ["off"],
    },
    settings: {
      react: {
        version: "18.2.0",
      },
    },
  },
);

export default eslintConfig;
