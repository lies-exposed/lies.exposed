import tanstackQuery from "@tanstack/eslint-plugin-query";
import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import globals from "globals";
import baseConfig from "./base.config.js";

if (!react.configs.flat) {
  throw new Error("react.configs.flat is not defined");
}

const eslintConfig = defineConfig(
  // Base TypeScript configuration
  ...baseConfig,

  // TanStack Query recommended rules
  ...tanstackQuery.configs["flat/recommended"],

  // React configuration
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...react.configs.flat.recommended,
    plugins: {
      react,
    },
    languageOptions: {
      ...react.configs.flat?.recommended.languageOptions,
      ecmaVersion: "latest",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        // Auto-detect React version
        version: "detect",
      },
    },
    rules: {
      // React rules
      "react/prop-types": "off", // Not needed with TypeScript

      // TypeScript rules adjustments for React
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
);

export default eslintConfig;
