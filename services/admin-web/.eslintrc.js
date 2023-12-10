module.exports = {
  extends: ["../../.eslintrc.js", "plugin:react/recommended"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@mui/material",
          "@mui/*/*/*",
          "!@mui/core/test-utils/*",
          "@liexp/core/src",
          "@liexp/shared/src",
          "@liexp/ui/src",
          "react-admin",
          "!@liexp/ui/lib/components/admin/react-admin",
        ],
      },
    ],
    "react/prop-types": ["off"],
    "no-console": 1,
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
};
