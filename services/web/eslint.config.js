import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import { defineProjectStructureConfig } from "@liexp/core/lib/eslint/base.config.js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: process.cwd(),
  rules: {
    // Reusable rule for page subfolders
    page_folder: {
      name: '{camelCase}',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        { name: 'index.tsx' },
        { name: '{PascalCase}.tsx' },
        { ruleId: 'page_folder' },
      ]
    },
  },

  structure: [
    // Allow any files in the root of the project
    { name: "*" },

    // The `src` folder structure
    {
      name: "src",
      children: [
        // client/ folder - Client-side code
        {
          name: "client",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            // Root-level client files
            { name: "{PascalCase}.tsx" },
            { name: "{camelCase}.tsx" },

            // components/ subfolder
            {
              name: "components",
              children: [
                { name: "index.ts" },
                { name: "index.tsx" },
                { name: "{PascalCase}.tsx" },
                {
                  name: "{camelCase}",
                  children: [
                    { name: "index.ts" },
                    { name: "index.tsx" },
                    { name: "{PascalCase}.tsx" },
                  ]
                },
              ]
            },

            // configuration/ subfolder
            {
              name: "configuration",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.ts" },
              ]
            },

            // pages/ subfolder
            {
              name: "pages",
              children: [
                { name: "index.ts" },
                { name: "index.tsx" },
                { name: "{PascalCase}.tsx" },
                // Special files like 404.tsx
                { name: "*.tsx" },
                { ruleId: "page_folder" },
              ]
            },

            // templates/ subfolder
            {
              name: "templates",
              children: [
                { name: "index.ts" },
                { name: "index.tsx" },
                { name: "{PascalCase}.tsx" },
              ]
            },

            // utils/ subfolder
            {
              name: "utils",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.utils.ts" },
                { name: "{camelCase}.ts" },
              ]
            },
          ]
        },

        // server/ folder - Server-side code
        {
          name: "server",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            { name: "{camelCase}.ts" },
            { name: "{camelCase}.tsx" },
            // kebab-case files (e.g., ssr-render.tsx)
            { name: "{kebab-case}.tsx" },
          ]
        },
      ],
    },
  ],
});

const eslintConfig = defineConfig(
  // Global ignores for non-TypeScript files
  {
    ignores: ["**/*.md", "**/*.css", "**/*.svg", "**/*.png", "**/*.jpg", "**/*.json", "**/*.html"],
  },
  folderStructureConfig,
  ...reactEslintConfig,
  {
    files: ['src/**/*.tsx', 'src/**/*.ts', 'eslint.config.js'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  }
);

export default eslintConfig;
