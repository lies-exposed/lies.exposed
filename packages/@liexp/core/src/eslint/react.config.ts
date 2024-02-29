import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import baseConfig from "./base.config.js";
import * as queryPlugin from "@tanstack/eslint-plugin-query";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});

console.log({ react, queryPlugin })


const eslintConfig = tseslint.config(...baseConfig,
  ...compat.plugins('@tanstack/eslint-plugin-query'),
   {
  // extends: [react.configs.recommended],
  plugins: {
    react,
  },
  rules: {
    "react/prop-types": ["off"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["off"],
  },
  //   extends: [
  //     "plugin:react/recommended",
  //     "plugin:@tanstack/eslint-plugin-query/recommended",
  //   ],
  //   plugins: ["@typescript-eslint", "react"],
  // settings: {
  //   "import/resolver": {
  //     typescript: {
  //       project: "./tsconfig.json",
  //     },
  //   },
  //   react: {
  //     version: "18.2.0",
  //   },
  // },
});

export default eslintConfig;
