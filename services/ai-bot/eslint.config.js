import baseEslintConfig from "@liexp/core/lib/eslint/base.config.js";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig({
  ...baseEslintConfig,
  files: ["bin/**/*.ts", "src/**/*.ts"],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.json"],
      tsconfigRootDir: import.meta.dirname,
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

export default eslintConfig;
