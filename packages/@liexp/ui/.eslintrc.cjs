module.exports = {
  extends: [
    "../../../.eslintrc.js",
    "plugin:react/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  parserOptions: {
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  rules: {
    "react/prop-types": ["off"],
    "import/named": ["off"],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@mui/material",
          "@mui/material/*/*",
          "!@mui/material/test-utils/*",
          "!@mui/material/styles",
          "@liexp/core/src",
          "@liexp/shared/src",
        ],
      },
    ],
  },
  settings: {
    react: {
      version: "18.2.0",
    },
  },
};
