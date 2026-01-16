import * as path from "path";
import { fileURLToPath } from "url";
import {
  baseConfig,
  defineProjectStructureConfig,
} from "@liexp/core/lib/eslint/base.config.js";
import {RULES} from '@liexp/core/lib/eslint/plugins/project-structure.plugin.js';
import { defineConfig } from "eslint/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const folderStructureConfig = defineProjectStructureConfig({
  projectRoot: __dirname,
  rules: {
    ...RULES.rules,
  },
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
        { name: "run.ts" },
        {
          name: "app",
          children: [
            { name: "{camelCase}.middleware.ts" },
            {
              name: "index.ts",
            },
            { name: "config.ts" },
            { name: "nations.seeder.ts" },
          ],
        },
        { ruleId: RULES.BIN_FOLDER.ruleId },
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
          ruleId: RULES.FLOWS_FOLDER.ruleId
        },
        { name: "migrations", children: [{ name: "*.ts" }] },
        { ruleId: RULES.QUERIES_FOLDER.ruleId },
        { ruleId: RULES.SCRIPTS_FOLDER.ruleId },
        { name: "utils", children: [{
          ruleId: RULES.TEST_FOLDER.ruleId
        }, { name: '{camelCase}(.utils)?.ts'}] },
        { ruleId: RULES.ROUTES_FOLDER.ruleId},
        { name: "types", children: [{ name: "{PascalCase}.ts" }] },
      ],
    },
  ],
});

const eslintConfig = defineConfig(folderStructureConfig, ...baseConfig, {
  files: ["bin/**/*.ts", "src/**/*.ts", "eslint.config.js"],
  ignores: ["**/*.d.ts"],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

export default eslintConfig;
