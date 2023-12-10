module.exports = {
  extends: "../../.eslintrc.js",
  root: true,
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "@typescript-eslint/restrict-plus-operands": ["off"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["off"],
  },
};
