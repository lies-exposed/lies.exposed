import { baseConfig, defineProjectStructureConfig } from "@liexp/core/lib/eslint/base.config.js";
import { defineConfig } from "eslint/config";

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: process.cwd(),
  rules: {
    // Reusable rule for test folders
    test_folder: {
      name: '__tests__',
      children: [
        { name: "{camelCase}.spec.ts" },
        { name: "{PascalCase}.spec.ts" },
        // TODO: Normalize test file naming - some use dotted patterns like media.helper.spec.ts
        // Consider renaming to mediaHelper.spec.ts or moving tests next to source files
        { name: "{camelCase}.helper.spec.ts" },
        { name: "{camelCase}.utils.spec.ts" },
      ]
    },

    // Reusable rule for provider folders (api/, http/, openai/, pdf/, blocknote/)
    // TODO: Normalize provider folder naming - EndpointQueriesProvider uses PascalCase
    // while others use camelCase. Consider renaming to endpointQueriesProvider
    provider_folder: {
      name: '({camelCase}|{PascalCase})',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.provider.ts' },
        { name: '{camelCase}.provider.spec.ts' },
        { name: '{camelCase}.provider.test-d.ts' },
        // TODO: Normalize blocknote file naming - currently mixed patterns:
        // - {PascalCase}.specs.ts (e.g., EventBlock.specs.ts, MediaBlock.specs.ts)
        // - {camelCase}.specs.ts (e.g., actorInline.specs.ts)
        // - {camelCase}.ts (e.g., getTextContents.ts, isValidValue.ts, ssr.ts, type.ts, utils.ts)
        // - {camelCase}.utils.ts (e.g., transform.utils.ts)
        { name: '{PascalCase}.specs.ts' },
        { name: '{camelCase}.specs.ts' },
        { name: '{camelCase}.ts' },
        { name: '{camelCase}.utils.ts' },
        { name: 'overrides.ts' },
        { ruleId: 'provider_folder' },
      ]
    },

    // Reusable rule for io/http subfolders
    io_http_subfolder: {
      name: '({PascalCase}|{camelCase}|{kebab-case})',
      folderRecursionLimit: 3,
      children: [
        { name: 'index.ts' },
        { name: '{PascalCase}.ts' },
        { name: '{camelCase}.ts' },
        { ruleId: 'test_folder' },
        { ruleId: 'io_http_subfolder' },
      ]
    },

    // Reusable rule for endpoints subfolders
    endpoints_subfolder: {
      name: '{camelCase}',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        // TODO: Normalize endpoint file naming - some use PascalCase (e.g., GroupMember.endpoints.ts)
        // while others use camelCase (e.g., actor.endpoints.ts)
        { name: '{PascalCase}.endpoints.ts' },
        { name: '{camelCase}.endpoints.ts' },
        { name: '{camelCase}.endpoint.ts' },
        { ruleId: 'endpoints_subfolder' },
      ]
    },

    // Reusable rule for helper subfolders
    helper_subfolder: {
      name: '{camelCase}',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.helper.ts' },
        { name: '{camelCase}.ts' },
        // TODO: Normalize helper file naming - some use kebab-case (e.g., search-event.ts)
        // Consider renaming to camelCase (e.g., searchEvent.ts)
        { name: '{kebab-case}.ts' },
        { ruleId: 'test_folder' },
        { ruleId: 'helper_subfolder' },
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
        { name: "globals.d.ts" },

        // endpoints/ folder
        {
          name: "endpoints",
          children: [
            { name: "Endpoints.ts" },
            { name: "helpers.ts" },
            // agent/ subfolder
            {
              name: "agent",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.endpoints.ts" },
              ]
            },
            // api/ subfolder with nested event types
            {
              name: "api",
              children: [
                { name: "index.ts" },
                // TODO: Normalize endpoint file naming - mixed PascalCase/camelCase patterns
                { name: "{PascalCase}.endpoints.ts" },
                { name: "{camelCase}.endpoints.ts" },
                { ruleId: "endpoints_subfolder" },
              ]
            },
          ]
        },

        // helpers/ folder
        {
          name: "helpers",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            { name: "{camelCase}.helper.ts" },
            { name: "{kebab-case}.ts" },
            { ruleId: "test_folder" },
            { ruleId: "helper_subfolder" },
          ]
        },

        // io/ folder
        {
          name: "io",
          children: [
            { name: "index.ts" },

            // io/Common/ subfolder
            {
              name: "Common",
              children: [
                { name: "index.ts" },
                { name: "{PascalCase}.ts" },
              ]
            },

            // io/http/ subfolder - main HTTP types
            {
              name: "http",
              children: [
                { name: "index.ts" },
                // Root-level PascalCase type files (Actor.ts, Group.ts, etc.)
                { name: "{PascalCase}.ts" },
                // Subfolders (Common/, Error/, Events/, Media/, etc.)
                { ruleId: "io_http_subfolder" },
              ]
            },

            // io/utils/ subfolder
            {
              name: "utils",
              children: [
                { name: "{PascalCase}.ts" },
              ]
            },

            // io/openai/ subfolder
            {
              name: "openai",
              children: [
                { name: "index.ts" },
                {
                  name: "prompts",
                  children: [
                    { name: "{camelCase}.prompts.ts" },
                    { name: "{camelCase}.type.ts" },
                  ]
                },
              ]
            },
          ]
        },

        // providers/ folder
        {
          name: "providers",
          children: [
            { name: "index.ts" },
            { ruleId: "provider_folder" },
          ]
        },

        // utils/ folder
        {
          name: "utils",
          children: [
            { name: "{camelCase}.ts" },
            { name: "{camelCase}.utils.ts" },
            { name: "{camelCase}.utils.spec.ts" },
            { name: "{PascalCase}.ts" },
            // TODO: Normalize utils file naming - some use kebab-case (e.g., structured-output.utils.ts)
            // Consider renaming to camelCase (e.g., structuredOutput.utils.ts)
            { name: "{kebab-case}.utils.ts" },
            { ruleId: "test_folder" },
          ]
        },

        // types/ folder
        {
          name: "types",
          children: [
            { name: "{PascalCase}.type.ts" },
          ]
        },
      ],
    },
  ],
});

const eslintConfig = defineConfig(
  folderStructureConfig,
  ...baseConfig,
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "eslint.config.js"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);

export default eslintConfig;
