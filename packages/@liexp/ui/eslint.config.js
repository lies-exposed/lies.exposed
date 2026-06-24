import { reactConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(...reactConfig, {
  files: ["src/**/*.ts", "src/**/*.tsx"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
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
