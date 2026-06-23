
import { baseConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(...baseConfig, {
  files: ["src/**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname
    },
  },
});