module.exports = {
  extends: ["../../.eslintrc", "plugin:react/recommended"],
  plugins: ["@typescript-eslint", "react"],
  parserOptions: {
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
      version: "16.12.0",
    },
  },
  rules: {
    "react/prop-types": ["off"],
    "@typescript-eslint/no-unnecessary-type-assertion": ["off"],
  },
};
