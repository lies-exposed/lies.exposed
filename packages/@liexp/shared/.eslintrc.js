module.exports = {
  extends: ["../../../.eslintrc.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  settings:{
    "import/ignore": ["uuid"],
  },
  rules: {
    
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "moment",
          "@liexp/core/src",
        ],
      },
    ],
  },
};
