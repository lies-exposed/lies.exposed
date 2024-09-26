import tseslint from "typescript-eslint";
import reactConfig from "@liexp/core/lib/eslint/react.config.js";

export default tseslint.config(...reactConfig, {
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      project: "./tsconfig.json",
    },
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["../*"],
      },
    ],
  },
});
