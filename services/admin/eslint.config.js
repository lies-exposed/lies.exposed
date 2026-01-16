import * as path from "path";
import { fileURLToPath } from "url";
import { defineProjectStructureConfig } from "@liexp/core/lib/eslint/base.config.js";
import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: __dirname,
  rules: {
    // Reusable rule for page subfolders (actors, areas, events, etc.)
    page_folder: {
      name: "({camelCase}|{kebab-case})",
      folderRecursionLimit: 3,
      children: [
        { name: "index.ts" },
        { name: "index.tsx" },
        // Admin pages follow {PascalCase}.tsx pattern
        { name: "{PascalCase}.tsx" },
        { ruleId: "page_folder" },
      ],
    },
  },

  structure: [
    // Allow any files in the root of the project
    { name: "*" },

    // The `src` folder structure
    {
      name: "src",
      children: [
        // Root files
        { name: "index.ts" },
        { name: "index.tsx" },
        { name: "{PascalCase}.tsx" },
        { name: "{camelCase}.ts" },

        // pages/ folder - Admin pages
        {
          name: "pages",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            // Root-level page files
            { name: "{PascalCase}.tsx" },
            // Page subfolders (actors, areas, events, etc.)
            { ruleId: "page_folder" },
          ],
        },

        // components/ folder - React components
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
              ],
            },
          ],
        },

        // configuration/ folder
        {
          name: "configuration",
          children: [{ name: "index.ts" }, { name: "{camelCase}.ts" }],
        },

        // context/ folder - React contexts
        {
          name: "context",
          children: [
            { name: "index.ts" },
            { name: "{PascalCase}Context.tsx" },
            { name: "{PascalCase}.tsx" },
          ],
        },

        // hooks/ folder - React hooks
        {
          name: "hooks",
          children: [
            { name: "index.ts" },
            { name: "use{PascalCase}.ts" },
            { name: "use{PascalCase}.tsx" },
          ],
        },

        // server/ folder - Server-side code
        {
          name: "server",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            { name: "{camelCase}.tsx" },
            {
              name: "context",
              children: [{ name: "index.ts" }, { name: "{camelCase}.ts" }],
            },
            {
              name: "io",
              children: [
                { name: "index.ts" },
                { name: "{SNAKE_CASE}.ts" },
                { name: "{PascalCase}.ts" },
              ],
            },
            {
              name: "routes",
              children: [
                { name: "index.ts" },
                // TODO: Normalize route file naming - uses kebab-case (agent-proxy.routes.ts)
                // Consider using camelCase (agentProxy.routes.ts) for consistency
                { name: "{kebab-case}.routes.ts" },
                { name: "{camelCase}.routes.ts" },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const eslintConfig = defineConfig(
  // Global ignores for non-TypeScript files
  {
    ignores: [
      "**/*.md",
      "**/*.css",
      "**/*.svg",
      "**/*.png",
      "**/*.jpg",
      "**/*.json",
    ],
  },
  folderStructureConfig,
  ...reactEslintConfig,
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "eslint.config.js"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@mui/material",
            "@mui/*/*/*",
            "!@mui/core/test-utils/*",
            "@liexp/*/src",
            "react-admin",
            "!@liexp/ui/lib/components/admin/react-admin",
            "!@ts-endpoint/react-admin",
          ],
        },
      ],
      "react/prop-types": ["off"],
      "no-console": 1,
    },
  },
);

export default eslintConfig;
