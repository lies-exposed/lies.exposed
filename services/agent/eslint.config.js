import { baseConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig(...baseConfig, {
  files: ["src/**/*.ts", "test/**/*.ts"],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
