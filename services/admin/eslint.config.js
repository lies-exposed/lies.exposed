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
