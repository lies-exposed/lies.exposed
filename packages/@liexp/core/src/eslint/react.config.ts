import tanstackQuery from "@tanstack/eslint-plugin-query";
import react from "eslint-plugin-react";
import globals from "globals";
import tseslint, { type Config } from "typescript-eslint";
import baseConfig from "./base.config.js";

if (!react.configs.flat) {
  throw new Error("react.configs.flat is not defined");
}

const eslintConfig: Config = tseslint.config(
  ...baseConfig,
  ...tanstackQuery.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...react.configs.flat.recommended,
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      react: react as any,
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
