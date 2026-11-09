# HOM-1284: MCP CRUD Tools Refactoring + E2E Tests

## Summary

Refactors MCP CRUD tools (Actors, Groups, Events, Links) to use direct `server.registerTool()` with `effectToZodStruct` instead of the `defineMcpTool` helper abstraction. Removes unused tool modules (media, nations, stories) and their helpers. Adds E2E tests for all CRUD operations.

## Changes

### Refactored MCP Tools
- **`actors.tool.ts`**, **`groups.tool.ts`**, **`events.tool.ts`**, **`links.tool.ts`**: Replaced `defineMcpTool` helper with direct `server.registerTool()` calls. Input schemas now use `effectToZodStruct` from `@liexp/shared` directly. Removed the intermediate `defineMcpTool` wrapper that converted Effect schemas to both Zod and typed handler input.
- **`helpers.ts`**: Deleted — no longer needed after removing `defineMcpTool` abstraction.

### Removed Unused Tools
- **`media.tool.ts`**, **`nations.tool.ts`**, **`stories.tool.ts`**: Deleted (unused via MCP endpoint).
- **`index.ts`**: Removed imports and registrations for deleted tools.
- **`toolNames.constants.ts`**: Removed `FIND_MEDIA`, `CREATE_MEDIA`, `EDIT_MEDIA`, `FIND_STORIES`, `CREATE_STORY`, `EDIT_STORY` constants.

### E2E Tests
- **`mcpToolsCRUD.e2e.ts`**: Added comprehensive E2E tests for all CRUD operations on Actors, Groups, Events, and Links. Each test uses a fresh MCP session via `callMcpTool()` helper.

### Config Fixes
- **`eslint.config.js`**: Added `^#.*` to `import-x/no-unresolved` ignore pattern so `#flows/*` imports resolve correctly.

## Verification

```bash
# Lint (with increased heap for large project)
node --max-old-space-size=4096 node_modules/.bin/eslint --cache services/api/src/routes/mcp/
# Result: 0 errors, 5 warnings (pre-existing @typescript-eslint/no-explicit-any)

# E2E Tests
pnpm --filter api run test:e2e -- --run
# Result: 96 test files passed, 299 tests passed, 2 skipped
```

## Diff Stats

- 13 files changed, 1099 insertions(+), 2451 deletions(-)
- Net reduction: ~1350 lines (removed abstractions + unused tools)

## Related

HOM-1284: Add MCP CRUD tools to lies.exposed API service
