import baseConfig from "@liexp/core/lib/eslint/base.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
  files: ["src/**/*.ts"],
  ignores: ["vitest.config.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      project: ["./tsconfig.json", "./packages/@liexp/*/tsconfig.json"],
    },
  },
  settings: {
    "import/ignore": ["uuid"],
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["moment", "@liexp/core/src", "@liexp/test/src"],
      },
    ],
  },
});
