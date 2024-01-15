module.exports = {
  extends: "../../../.eslintrc.js",
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: "./",
    project: ["./tsconfig.json"],
  },
  rules: {
    "import/named": ["off"],
  },
};
