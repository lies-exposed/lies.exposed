module.exports = {
  root: true,
  extends: [
    "standard-with-typescript",
    "plugin:import/typescript",
    "plugin:import/recommended",
    "prettier",
    "plugin:fp-ts/recommended",
    "plugin:fp-ts/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "fp-ts"],
  parserOptions: {
    project: ["./tsconfig.test.json"],
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
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "moment",
          "react-admin",
          "!@liexp/ui/lib/components/admin/react-admin",
          "@liexp/core/src",
          "@liexp/shared/src",
          "@liexp/ui/src",
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
  },
};
