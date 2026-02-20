import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import fpTS from "eslint-plugin-fp-ts";
import { importX } from "eslint-plugin-import-x";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

const config = defineConfig(
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Prettier integration (should be last to override conflicting rules)
  eslintPluginPrettierRecommended,

  // Custom plugin and rule configuration
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "fp-ts": fpTS,
      // @ts-expect-error - import-x plugin has type incompatibilities with strict ESLint types, but works at runtime
      "import-x": importX,
    },
    extends: ["import-x/flat/recommended", "import-x/flat/typescript"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        projectService: true,
      },
    },
    // settings: {
    //   "import-x/resolver": {
    //     typescript: true,
    //     node: true,
    //   },
    // },
    rules: {
      // fp-ts plugin rules
      "fp-ts/no-lib-imports": "off",

      // Import plugin rules
      "import-x/default": "off",
      "import-x/no-named-as-default-member": "off",
      "import-x/namespace": "off",
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

      // General ESLint rules
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@liexp/core/src/*",
            "@liexp/shared/src/*",
            "@liexp/ui/src/*",
            "@liexp/backend/src/*",
          ],
          // Ban the @liexp/io barrel re-export. When a file mixes this path with a
          // direct sub-path import (e.g. '@liexp/io/lib/http/Queue/index.js') TypeScript
          // sees two different module instances of the same type and emits
          // "Two different types with this name exist, but they are unrelated."
          // Use the direct sub-path everywhere instead:
          //   import * as Queue from "@liexp/io/lib/http/Queue/index.js"
          //   import { UUID }   from "@liexp/io/lib/http/Common/UUID.js"
          paths: [
            {
              name: "@liexp/io/lib/http/index.js",
              message:
                "Import directly from the sub-module path instead " +
                "(e.g. '@liexp/io/lib/http/Queue/index.js', '@liexp/io/lib/http/Actor.js'). " +
                "Importing via this barrel re-export creates duplicate TypeScript module " +
                "instances when any direct sub-path import also exists in the same program.",
            },
          ],
        },
      ],

      // TypeScript ESLint rules - enabled
      "@typescript-eslint/return-await": ["error"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // TypeScript ESLint rules - disabled (with rationale comments)
      "@typescript-eslint/restrict-template-expressions": "off", // Allow any in template strings
      "@typescript-eslint/no-redeclare": "off", // Allow redeclaration (fp-ts pattern)
      "@typescript-eslint/promise-function-async": "off", // Allow non-async promise functions
      "@typescript-eslint/strict-boolean-expressions": "off", // Allow truthy/falsy checks
      "@typescript-eslint/restrict-plus-operands": "off", // Allow mixed type addition
      "@typescript-eslint/no-unsafe-argument": "off", // TODO: Enable after cleanup
      "@typescript-eslint/unbound-method": "off", // Allow unbound methods
      "@typescript-eslint/no-unsafe-member-access": "off", // TODO: Enable after cleanup
      "@typescript-eslint/no-unsafe-assignment": "off", // TODO: Enable after cleanup
      "@typescript-eslint/no-empty-function": "off", // Allow empty functions
      "@typescript-eslint/no-unsafe-return": "off", // TODO: Enable after cleanup
      "@typescript-eslint/no-unsafe-call": "off", // TODO: Enable after cleanup
    },
  },

  // Test file overrides
  {
    files: ["test/**/*.ts", "**/*.spec.ts", "**/*.e2e.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);

export default config;
