import eslint from "@eslint/js";
import fpTS from "eslint-plugin-fp-ts";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

const config: any = tseslint.config(
  eslint.configs.recommended,
  jsdoc.configs["flat/recommended-typescript-error"],
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeCheckedOnly,
  ...tseslint.configs.stylisticTypeCheckedOnly,
  eslintPluginPrettierRecommended,
  {
    plugins: { "fp-ts": fpTS, import: importPlugin, jsdoc },
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "fp-ts/no-lib-imports": "off",
      // "fp-ts/no-module-imports": "error",
      "import/default": "off",
      "import/no-named-as-default-member": "off",
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
        },
      ],
      "import/namespace": "off",
      "import/extensions": [
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
            "react-admin",
            "!@liexp/ui/lib/components/admin/react-admin",
            "@liexp/core/src",
            "@liexp/shared/src",
            "@liexp/ui/src",
            "uuid",
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
      "@typescript-eslint/no-unused-vars": ["off"],
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
