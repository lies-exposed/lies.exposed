// @ts-check
import { reactConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(...reactConfig, {
  files: ["src/**/*.ts", "src/**/*.tsx"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@mui/material",
          "@mui/*/*/*",
          "!@mui/core/test-utils/*",
          "@liexp/*/src",
          "react-admin",
          "!@liexp/ui/lib/components/admin/react-admin",
          "!@ts-endpoint/react-admin",
        ],
      },
    ],
    "react/prop-types": ["off"],
    "no-console": 1,
  },
});
