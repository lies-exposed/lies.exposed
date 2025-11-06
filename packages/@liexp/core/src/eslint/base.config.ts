import "eslint-import-resolver-typescript";
import eslint from "@eslint/js";
import fpTS from "eslint-plugin-fp-ts";
import { importX } from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

const config = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeCheckedOnly,
  ...tseslint.configs.stylisticTypeCheckedOnly,
  eslintPluginPrettierRecommended,
  {
    plugins: { "fp-ts": fpTS, "import-x": importX },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // parser: tsParser,
      // parserOptions: {
      //   project: ["./tsconfig.json"],
      //   tsconfigRootDir: import.meta.dirname,
      // },
    },
    // settings: {
    //   "import-x/resolver": {
    //     typescript: {
    //       project: "./tsconfig.json",
    //     },
    //     node: {
    //       extensions: [".js", ".jsx", ".ts", ".tsx"],
    //     },
    //   },
    // },
    rules: {
      "fp-ts/no-lib-imports": "off",
      "import-x/default": "off",
      "import-x/no-named-as-default-member": "off",
      "import-x/newline-after-import": ["error", { count: 1 }],
      "import-x/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          "newlines-between": "never",
        },
      ],
      "import-x/namespace": "off",
      "import-x/extensions": [
        "error",
        "ignorePackages",
        {
          js: "always",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@liexp/core/src/*",
            "@liexp/shared/src/*",
            "@liexp/ui/src/*",
            "@liexp/backend/src/*",
          ],
        },
      ],
      "no-console": "error",
      "@typescript-eslint/restrict-template-expressions": ["off"],
      "@typescript-eslint/no-redeclare": ["off"],
      "@typescript-eslint/return-await": ["error"],
      "@typescript-eslint/promise-function-async": ["off"],
      "@typescript-eslint/strict-boolean-expressions": ["off"],
      "@typescript-eslint/restrict-plus-operands": ["off"],
      "@typescript-eslint/no-unsafe-argument": ["off"],
      "@typescript-eslint/unbound-method": ["off"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      // to be enabled
      "@typescript-eslint/no-unsafe-member-access": ["off"],
      "@typescript-eslint/no-unsafe-assignment": ["off"],
      "@typescript-eslint/no-empty-function": ["off"],
      "@typescript-eslint/no-unsafe-return": ["off"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unsafe-call": ["off"],
    },
  },
  {
    files: ["test/**/*.ts", "**/*.spec.ts", "**/*.e2e.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);

export default config;
