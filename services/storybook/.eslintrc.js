module.exports = {
  root: true,
  extends: ["../../.eslintrc.js", "plugin:react/recommended"],
  plugins: ["@typescript-eslint", "react"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["../*"],
      },
    ],
    "react/prop-types": ["off"],
    "@typescript-eslint/no-unused-vars": ["off"],
  },
  settings: {
    react: {
      version: "18.2.0",
    },
  },
};
