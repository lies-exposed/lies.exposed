import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...reactEslintConfig, {
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.json"],
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
