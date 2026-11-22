import tseslint from "typescript-eslint";

// services/data is excluded from linting: `data` has no entry in
// pnpm-workspace.yaml so `pnpm -r run lint` never reaches it, CI has no lint
// command for it (see the service matrix in .github/workflows/pull-request.yml),
// and vitest already excludes "**/services/data" (vitest.config.mjs).
//
// The previous config imported "./lib/eslint/base.config.js", a path removed
// when the shared rules moved to @liexp/eslint-config (#3118), so running
// `pnpm data lint` or plain `eslint src` crashed at config load rather than
// finding nothing to check. Declaring no rules here makes the exclusion an
// explicit, parseable config: files still parse with the TS parser, but no
// rule — including @typescript-eslint/no-explicit-any from PR #4165 — applies.
// `noInlineConfig` keeps the pre-flat-config `eslint-disable` comments in src
// (import/*, @typescript-eslint/naming-convention) from becoming
// "definition for rule not found" errors now that no plugins are registered.
export default [
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "off",
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {},
  },
];
