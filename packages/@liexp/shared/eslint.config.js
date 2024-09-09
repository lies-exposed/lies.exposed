import baseConfig from "@liexp/core/lib/eslint/base.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...baseConfig, {
  files: ["src/**/*.ts", "src/**/*.tsx"],
  ignores: ["eslint.config.js", "vitest.config.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      project: ["./tsconfig.json"],
    },
  },
});
