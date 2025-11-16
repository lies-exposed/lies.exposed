import baseEslintConfig from "@liexp/core/lib/eslint/base.config.js";
import tseslint from "typescript-eslint";

const eslintConfig = tseslint.config(...baseEslintConfig, {
  files: ["bin/**/*.ts", "src/**/*.ts"],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
