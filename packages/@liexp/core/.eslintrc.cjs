module.exports = {
  extends: "../../../.eslintrc.js",
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "import/named": ["off"],
  },
};
