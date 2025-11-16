import tseslint from "typescript-eslint";
import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import { defineConfig } from "eslint/config";

export default defineConfig(...reactEslintConfig, {
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
    "react/prop-types": ["off"],
    "import-x/named": ["off"],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@mui/material",
          "@mui/material/*/*",
          "!@mui/material/test-utils/*",
          "!@mui/material/styles",
          "@liexp/core/src",
          "@liexp/shared/src",
        ],
      },
    ],
  },
});
