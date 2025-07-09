import tseslint from "typescript-eslint";
import baseEslintConfig from "./packages/@liexp/core/lib/eslint/base.config.js";

const eslintConfig = tseslint.config(...baseEslintConfig, {
  // ignores: ["**/packages/@liexp/*/lib/**", "**/services/*/build/**"],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.eslint.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
