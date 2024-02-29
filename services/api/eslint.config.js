import tseslint from "typescript-eslint";
import baseEslintConfig from "@liexp/core/lib/eslint/base.config.js";

const eslintConfig = tseslint.config(...baseEslintConfig, {
  files: [
    "bin/**/*.ts",
    "src/**/*.ts"
  ],
  ignores: [
    "test/**/*.ts",
  ],
  languageOptions: {
    parserOptions: {
      project: [
        "./tsconfig.json"
      ],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/restrict-plus-operands": ["off"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"]
  },
});

console.log(eslintConfig);

export default eslintConfig;
