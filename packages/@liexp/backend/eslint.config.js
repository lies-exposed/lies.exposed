import { baseConfig, defineProjectStructureConfig } from '@liexp/core/lib/eslint/base.config.js'
import { defineConfig } from 'eslint/config'
import tseslint from "typescript-eslint";
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: __dirname,
  rules: {
    // Reusable rule for test folders
    test_folder: {
      name: '__tests__',
      children: [
        { name: '{camelCase}.spec.ts' },
        { name: '{PascalCase}.spec.ts' },
        // TODO: Normalize test file naming - some use multiple dots (agent.http.client.spec.ts)
        // or kebab-case (vite-server-helper.spec.ts)
        { name: '*.spec.ts' },
      ]
    },

    // Reusable rule for provider subfolders
    provider_folder: {
      name: '{camelCase}',
      folderRecursionLimit: 3,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.provider.ts' },
        { name: '{camelCase}.provider.spec.ts' },
        // TODO: Normalize provider naming - some use kebab-case (local-space.provider.ts)
        { name: '{kebab-case}.provider.ts' },
        { name: '{camelCase}.helper.ts' },
        { name: '{camelCase}.constants.ts' },
        { name: '{camelCase}.error.ts' },
        { name: '{camelCase}.tools.ts' },
        { name: '{camelCase}.ts' },
        { name: '{PascalCase}.ts' },
        { name: 'types.ts' },
        { ruleId: 'test_folder' },
        { ruleId: 'provider_folder' },
      ]
    },

    // Reusable rule for flow subfolders
    // TODO: Normalize flow folder naming - mixed patterns (camelCase, kebab-case, PascalCase)
    flow_folder: {
      name: '({camelCase}|{kebab-case}|{PascalCase})',
      folderRecursionLimit: 4,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.flow.ts' },
        { name: '{camelCase}.flow.spec.ts' },
        { name: '{camelCase}.ts' },
        { name: '{PascalCase}.ts' },
        { name: '{PascalCase}.type.ts' },
        { ruleId: 'test_folder' },
        { ruleId: 'flow_folder' },
      ]
    },

    // Reusable rule for query subfolders
    // TODO: Normalize query folder naming - some use kebab-case (social-post)
    query_folder: {
      name: '({camelCase}|{kebab-case})',
      folderRecursionLimit: 3,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.query.ts' },
        { name: '{camelCase}.config.ts' },
        { name: '{PascalCase}.ts' },
        { ruleId: 'query_folder' },
      ]
    },

    // Reusable rule for pubsub subfolders
    pubsub_folder: {
      name: '{camelCase}',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.pubSub.ts' },
        { ruleId: 'pubsub_folder' },
      ]
    },

    // Reusable rule for test utility subfolders
    test_util_folder: {
      name: '{camelCase}',
      folderRecursionLimit: 2,
      children: [
        { name: 'index.ts' },
        { name: '{camelCase}.ts' },
        { name: '{camelCase}.mock.ts' },
        { name: '{camelCase}.utils.ts' },
        { name: '{PascalCase}.arb.ts' },
        { ruleId: 'test_util_folder' },
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
        // Root files
        { name: "index.ts" },

        // Root-level __tests__/ folder
        { ruleId: "test_folder" },

        // providers/ folder
        {
          name: "providers",
          children: [
            { name: "index.ts" },
            // Root-level provider files
            { name: "{PascalCase}.provider.ts" },
            { name: "{camelCase}.provider.ts" },
            // Provider subfolders
            { ruleId: "provider_folder" },
          ]
        },

        // scrapers/ folder
        {
          name: "scrapers",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
          ]
        },

        // utils/ folder
        {
          name: "utils",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.utils.ts" },
            { name: "{camelCase}.ts" },
            // TODO: Normalize utils naming - some use kebab-case (data-source.ts)
            { name: "{kebab-case}.ts" },
          ]
        },

        // clients/ folder
        {
          name: "clients",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.client.ts" },
            // TODO: Normalize client naming - some use multiple dots (agent.http.client.ts)
            { name: "*.client.ts" },
          ]
        },

        // context/ folder
        {
          name: "context",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.context.ts" },
            {
              name: "load",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.load.ts" },
              ]
            },
          ]
        },

        // entities/ folder
        {
          name: "entities",
          children: [
            { name: "index.ts" },
            { name: "{PascalCase}.entity.ts" },
            // TODO: Normalize entity naming - some use dots (Event.v2.entity.ts)
            { name: "*.entity.ts" },
            {
              name: "abstract",
              children: [
                { name: "index.ts" },
                { name: "{PascalCase}.entity.ts" },
                // TODO: Normalize abstract entity naming - uses lowercase (base.entity.ts, deletable.entity.ts)
                { name: "{camelCase}.entity.ts" },
              ]
            },
            {
              name: "events",
              children: [
                { name: "index.ts" },
                { name: "{PascalCase}.entity.ts" },
              ]
            },
          ]
        },

        // errors/ folder
        {
          name: "errors",
          children: [
            { name: "index.ts" },
            { name: "{PascalCase}.ts" },
            { name: "{camelCase}.ts" },
            { ruleId: "test_folder" },
          ]
        },

        // express/ folder
        {
          name: "express",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            // TODO: Normalize express file naming - uses kebab-case (vite-server-helper.ts)
            { name: "{kebab-case}.ts" },
            { ruleId: "test_folder" },
            {
              name: "decoders",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.ts" },
                // TODO: Normalize decoder naming - uses dot pattern (request.decoder.ts)
                { name: "{camelCase}.decoder.ts" },
              ]
            },
            {
              name: "middleware",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.ts" },
                // TODO: Normalize middleware naming - uses dot pattern (audit.middleware.ts, auth.middleware.ts)
                { name: "{camelCase}.middleware.ts" },
                { name: "{camelCase}.factory.ts" },
              ]
            },
            {
              name: "vite",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.ts" },
                // TODO: Normalize vite file naming - uses kebab-case (spa-server.ts)
                { name: "{kebab-case}.ts" },
              ]
            },
          ]
        },

        // flows/ folder
        {
          name: "flows",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.flow.ts" },
            { ruleId: "flow_folder" },
          ]
        },

        // io/ folder
        {
          name: "io",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.io.ts" },
            // TODO: Normalize IO naming - mixed PascalCase (Actor.io.ts) and camelCase (actor.io.ts)
            { name: "{PascalCase}.io.ts" },
            // TODO: Normalize IO folder - some files aren't .io.ts (DomainCodec.ts, ENV.ts)
            { name: "{PascalCase}.ts" },
            { name: "{SNAKE_CASE}.ts" },
            {
              name: "event",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.io.ts" },
                // TODO: Normalize IO naming - some use kebab-case (scientific-study.io.ts)
                { name: "{kebab-case}.io.ts" },
              ]
            },
          ]
        },

        // pubsub/ folder
        {
          name: "pubsub",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.pubSub.ts" },
            { ruleId: "pubsub_folder" },
          ]
        },

        // queries/ folder
        {
          name: "queries",
          children: [
            { name: "index.ts" },
            { ruleId: "query_folder" },
          ]
        },

        // services/ folder
        {
          name: "services",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.service.ts" },
            // TODO: Normalize service naming - some use kebab-case (entity-repository.service.ts)
            { name: "{kebab-case}.service.ts" },
            // TODO: Normalize service folder naming - some use kebab-case folders (agent-chat)
            {
              name: "({camelCase}|{kebab-case})",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.service.ts" },
                { name: "{kebab-case}.service.ts" },
              ]
            },
          ]
        },

        // test/ folder - Test utilities
        {
          name: "test",
          children: [
            { name: "index.ts" },
            { name: "{camelCase}.ts" },
            // TODO: Normalize test config naming - uses kebab/dot pattern (vitest.base-config.ts)
            { name: "*.ts" },
            {
              name: "arbitraries",
              children: [
                { name: "index.ts" },
                { name: "{PascalCase}.arb.ts" },
              ]
            },
            {
              name: "mocks",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.mock.ts" },
                // TODO: Normalize mock naming - some use kebab-case (blocknote-core.mock.ts)
                { name: "{kebab-case}.mock.ts" },
                // TODO: Normalize mock utils naming - uses dot pattern (mock.utils.ts)
                { name: "{camelCase}.utils.ts" },
              ]
            },
            {
              name: "setup",
              children: [
                { name: "index.ts" },
                { name: "{camelCase}.ts" },
                // TODO: Normalize setup file naming - uses kebab-case (transactional-db.ts)
                { name: "{kebab-case}.ts" },
              ]
            },
            { ruleId: "test_util_folder" },
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
    files: ["src/**/*.ts", "eslint.config.js"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
);

export default eslintConfig;
