import tseslint from 'typescript-eslint'
import baseConfig from './lib/eslint/base.config.js'

export default tseslint.config(
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        // Use projectService for automatic TypeScript project detection
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "import-x/named": ["off"],
    },
  },
);
