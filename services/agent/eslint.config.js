import * as path from 'path';
import {
  baseConfig,
  defineProjectStructureConfig,
} from "@liexp/core/lib/eslint/base.config.js";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from 'url';
import { RULES } from '@liexp/core/lib/eslint/plugins/project-structure.plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: __dirname,
  rules: RULES.rules,
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
        { name: "run.ts" },
        { name: 'cli', children: [{ name: '{kebab-case}(.command)?.ts' }] },
        {
          name: "context",
          children: [
            { name: "index.ts" },
            { name: "load.ts" },
            { name: "{camelCase}.type.ts" },
          ],
        },
        { name: "io", children: [{ name: "{PascalCase}(.spec)?.ts" }] },
        {
          ruleId: RULES.FLOWS_FOLDER.ruleId,
        },
        {
          ruleId: RULES.ROUTES_FOLDER.ruleId
        }
      ],
    },
  ],
});

const eslintConfig = defineConfig(folderStructureConfig, ...baseConfig, {
  files: ["bin/**/*.ts", "src/**/*.ts", "eslint.config.js"],
  ignores: ["**/*.d.ts", "*.json"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
