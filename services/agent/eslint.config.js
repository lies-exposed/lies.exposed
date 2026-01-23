import {baseConfig} from "@liexp/eslint-config";
import tseslint from "typescript-eslint";

const eslintConfig = tseslint.config(...baseConfig, {
  files: ["src/**/*.ts", "test/**/*.ts"],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
