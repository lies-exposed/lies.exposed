module.exports = {
  extends: "../../.eslintrc.js",
  parserOptions: {
    tsconfigRootDir: "./",
    project: ["./tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/restrict-plus-operands": ["off"],
  },
};
