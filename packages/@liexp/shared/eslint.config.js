import { baseConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(...baseConfig, {
  files: ["src/**/*.ts", "src/**/*.tsx"],
  ignores: ["eslint.config.js", "vitest.config.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
