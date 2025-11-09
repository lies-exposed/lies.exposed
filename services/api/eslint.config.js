import baseEslintConfig from "@liexp/core/lib/eslint/base.config.js";
import tseslint from "typescript-eslint";

const eslintConfig = tseslint.config(...baseEslintConfig, {
  files: ["bin/**/*.ts", "src/**/*.ts"],
  ignores: ["**/*.d.ts", "src/migrations/*.ts"],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
