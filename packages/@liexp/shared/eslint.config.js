import baseConfig from "@liexp/core/lib/eslint/base.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
  files: ["src/**/*.ts", "src/**/*.tsx", "privategpt/*.ts"],
  ignores: ["eslint.config.js", "vitest.config.ts"],
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
        patterns: ["moment", "@liexp/core/src", "@liexp/test/src"],
      },
    ],
  },
});
