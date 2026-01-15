import { defineConfig } from 'eslint/config'
import { baseConfig, defineProjectStructureConfig } from './lib/eslint/base.config.js'
import tseslint from "typescript-eslint";

// @ts-check

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: process.cwd(),
  structure: [
    // Allow any files in the root of your project, like package.json, eslint.config.mjs, etc.
    // You can add rules for them separately.
    // You can also add exceptions like this: "(?!folderStructure)*".
    { name: "*" },

    // Allow any folders in the root of your project.
    // { name: "*", children: [] },

    // The `src` folder should follow this structure.
    {
      name: "src",
      children: [
        // src/index.tsx
        { name: "index.ts" },
        { name: "env", children: [{ name: "{kebab-case}.ts" }] },
        { name: "esm", children: [{ name: "{kebab-case}.ts" }] },
        { name: "frontend", children: [{ name: "*", children: [{ name: "{camelCase}.ts" }] }, { name: "{camelCase}.ts" }] },
        { name: "fp", children: [{ name: "index.ts" }] },
        { name: "eslint", children: [{ name: "{camelCase}.config.ts" }, { name: 'plugins', children: [{ name: '{kebab-case}.plugin.ts' }] }] },
        { name: "logger", children: [{ name: "(index|{PascalCase}).ts" }] },
      ],
    },
  ],
});

export default defineConfig(
  ...folderStructureConfig,
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    ignores: ["**/*.d.ts", "*.json"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        // Use projectService for automatic TypeScript project detection
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "import-x/named": ["off"],
    },
  },
);
