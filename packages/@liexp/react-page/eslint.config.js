
import tseslint from "typescript-eslint";
import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";

export default tseslint.config(...reactEslintConfig, {
  files: [
    "src/**/*.ts",
    "src/**/*.tsx"],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "react/prop-types": ["off"],
    "import/named": ["off"],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@liexp/core/src",
          "@liexp/shared/src",
        ],
      },
    ],
  },
});
