import { baseConfig } from "@liexp/eslint-config";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig(...baseConfig, {
  files: ["bin/**/*.ts", "src/**/*.ts"],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "import-x/no-unresolved": [
      "error",
      {
        ignore: ["^@modelcontextprotocol/sdk/server/.*\\.js$"],
      },
    ],
  },
});

export default eslintConfig;
