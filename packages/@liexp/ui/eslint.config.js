import tseslint from "typescript-eslint";
import reactEslintConfig from "@liexp/core/lib/eslint/react.config.js";
import { defineProjectStructureConfig } from "@liexp/core/lib/eslint/base.config.js";
import { defineConfig } from "eslint/config";

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: process.cwd(),
  // Ignore non-TypeScript files that ESLint shouldn't parse
  ignorePatterns: ["**/*.scss", "**/*.png", "**/*.svg", "**/*.jpg", "**/*.jpeg", "**/*.gif"],
  rules: {
    // Reusable rule for component folders (deeply nested)
    // TODO: Normalize folder naming - mixed PascalCase (Cards, Common, BlockNote)
    // and camelCase (actors, admin, events). Consider standardizing to PascalCase for components.
    component_folder: {
      name: '({PascalCase}|{camelCase}|{kebab-case})',
      folderRecursionLimit: 6,
      children: [
        { name: 'index.ts' },
        { name: 'index.tsx' },
        // React components (PascalCase)
        { name: '{PascalCase}.tsx' },
        { name: '{PascalCase}.ts' },
        // Plugins pattern
        { name: '{PascalCase}.plugin.tsx' },
        // Spec/test files
        // TODO: Consider moving test files to __tests__ folders for consistency
        { name: '{PascalCase}.spec.tsx' },
        { name: '{camelCase}.spec.tsx' },
        // Utils within component folders
        { name: '{camelCase}.utils.ts' },
        { name: '{camelCase}.ts' },
        // TODO: Normalize camelCase.tsx files to PascalCase.tsx for React components
        { name: '{camelCase}.tsx' },
        { name: 'types.ts' },
        // kebab-case files (e.g., react-admin.ts, event-icons.ts)
        // TODO: Normalize to camelCase (e.g., reactAdmin.ts, eventIcons.ts)
        { name: '{kebab-case}.ts' },
        // JSON data files
        // TODO: Consider moving data files to a dedicated data/ or assets/ folder
        { name: '{kebab-case}.json' },
        // Recursive component subfolders
        { ruleId: 'component_folder' },
      ]
    },

    // Reusable rule for container folders
    container_folder: {
      name: '({PascalCase}|{camelCase})',
      folderRecursionLimit: 3,
      children: [
        { name: 'index.ts' },
        { name: 'index.tsx' },
        { name: '{PascalCase}.tsx' },
        { name: '{PascalCase}.ts' },
        { name: '{camelCase}.tsx' },
        { name: 'types.ts' },
        { ruleId: 'container_folder' },
      ]
    },

    // Reusable rule for template folders
    template_folder: {
      name: '{camelCase}',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        { name: 'index.tsx' },
        { name: '{PascalCase}.tsx' },
        { ruleId: 'template_folder' },
      ]
    },
  },

  structure: [
    // Allow any files in the root of the project (package.json, eslint.config.js, etc.)
    { name: "*" },

    // The `src` folder structure
    {
      name: "src",
      children: [
        // Root files
        { name: "index.ts" },

        // client/ folder - API client code
        {
          name: "client",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            {
              name: "admin",
              children: [
                { name: "{PascalCase}.ts" },
              ]
            },
          ]
        },

        // components/ folder - main React components
        {
          name: "components",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            // Root-level component files
            { name: "{PascalCase}.tsx" },
            // Component subfolders (Cards, Common, admin, etc.)
            { ruleId: "component_folder" },
          ]
        },

        // containers/ folder - container components
        {
          name: "containers",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            // Root-level container files
            { name: "{PascalCase}.tsx" },
            // Container subfolders
            { ruleId: "container_folder" },
          ]
        },

        // context/ folder - React contexts
        {
          name: "context",
          children: [
            { name: "index.ts" },
            { name: "{PascalCase}Context.tsx" },
            { name: "{PascalCase}.tsx" },
          ]
        },

        // hooks/ folder - React hooks
        {
          name: "hooks",
          children: [
            { name: "index.ts" },
            // TODO: Normalize hook file naming - some use .ts, others .tsx
            // Consider using .ts for hooks without JSX, .tsx only when returning JSX
            { name: "use{PascalCase}.ts" },
            { name: "use{PascalCase}.tsx" },
          ]
        },

        // i18n/ folder - internationalization
        {
          name: "i18n",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.provider.ts" },
            // Locale files follow BCP 47 language tags (e.g., en-US, pt-BR)
            // This is a standard convention for locale identifiers
            { name: "*-*.ts" },
          ]
        },

        // icons/ folder - icon components
        {
          name: "icons",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            {
              name: "{PascalCase}",
              children: [
                { name: "{PascalCase}.tsx" },
              ]
            },
          ]
        },

        // react/ folder - React utilities
        {
          name: "react",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            { name: "types.ts" },
          ]
        },

        // state/ folder - state management
        {
          name: "state",
          children: [
            { name: "index.ts" },
            {
              name: "queries",
              children: [
                { name: "index.ts" },
                { name: "{PascalCase}.ts" },
                { name: "{camelCase}.ts" },
                { name: "type.ts" },
              ]
            },
          ]
        },

        // templates/ folder - page templates
        {
          name: "templates",
          children: [
            { name: "index.ts" },
            { name: "index.tsx" },
            { name: "{PascalCase}.tsx" },
            { ruleId: "template_folder" },
          ]
        },

        // theme/ folder - theme configuration
        {
          name: "theme",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
          ]
        },

        // utils/ folder - utility functions
        {
          name: "utils",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.utils.ts" },
            { name: "{camelCase}.ts" },
          ]
        },

        // vite/ folder - Vite configuration
        {
          name: "vite",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            {
              name: "plugins",
              children: [
                { name: "index.ts" },
                // TODO: Normalize plugin file naming - uses kebab-case (react-virtualized.ts)
                // Consider using camelCase (reactVirtualized.ts)
                { name: "{kebab-case}.ts" },
                { name: "{camelCase}.ts" },
              ]
            },
          ]
        },
      ],
    },
  ],
});

const eslintConfig = defineConfig(
  // Global ignores for non-TypeScript files
  {
    ignores: ["**/*.scss", "**/*.png", "**/*.svg", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.json"],
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
      "react/prop-types": ["off"],
      "import-x/named": ["off"],
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
  }
);

export default eslintConfig;
