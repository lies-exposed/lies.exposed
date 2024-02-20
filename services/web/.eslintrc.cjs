module.exports = {
  root: true,
  extends: [
    "../../.eslintrc.js",
    "plugin:react/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  plugins: ["@typescript-eslint", "react"],
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
    react: {
      version: "18.2.0",
    },
  },
  rules: {
    "react/prop-types": ["off"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["off"],
  },
};
