module.exports = {
  extends: ["../../../.eslintrc.js"],
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  settings: {
    "import/ignore": ["uuid"],
  },
  ignorePatterns: ["vitest.config.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: ["moment", "@liexp/core/src"],
      },
    ],
  },
};
