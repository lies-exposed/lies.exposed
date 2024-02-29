
import tseslint from "typescript-eslint";
import baseConfig from "@liexp/core/lib/eslint/base.config.js";

export default tseslint.config(...baseConfig, {
  files: ["src/**/*.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      project: ["./tsconfig.json"],
    },
  },
  settings: {
    "import/ignore": ["uuid"],
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["moment", "@liexp/core/src"],
      },
    ],
  },
});