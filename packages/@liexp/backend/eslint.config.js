
import baseConfig from '@liexp/core/lib/eslint/base.config.js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
