import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import tseslint from "typescript-eslint";

export default tseslint.config(...reactEslintConfig, {
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
