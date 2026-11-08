## Summary

Migrate groups/links/actors/events MCP tools to use a typed `defineMcpTool` helper that converts Effect schema to both Zod (for MCP inputSchema) and provides typed handler input via `Schema.decodeUnknownSync`.

## Changes

### New file
- `services/api/src/routes/mcp/tools/helpers.ts`: `defineMcpTool` helper

### Migrated files (5 files, 608 insertions, 840 deletions)
- `groups.tool.ts`: 3 tools (find, create, edit)
- `links.tool.ts`: 3 tools (find, create, edit)
- `actors.tool.ts`: 3 tools (find, create, edit)
- `events.tool.ts`: 3 tools (find, create, edit)

## Pattern Change

**Before:**
```typescript
const inputSchema = effectToZodStruct(Schema.Struct({ ... }));
server.registerTool(name, { inputSchema }, async (opts) => {
  const { field } = opts ?? {};  // opts is unknown, needs casting
});
```

**After:**
```typescript
const tool = defineMcpTool(Schema.Struct({ ... }), async (input) => {
  const { field } = input;  // input is fully typed
});
server.registerTool(name, { inputSchema: tool.inputSchema }, tool.handler);
```

## Acceptance Criteria

- [x] api/routes/mcp `any` lines reduced (from ~24 to ~8)
- [x] All 4 tool files migrated (groups, links, actors, events)
- [x] Single atomic PR (5 files, within 10 file limit)
- [x] No `effectToZodStruct` usage in migrated files
- [x] ESLint passes (remaining warnings are flow function type mismatches, not MCP input related)

## Verification

```
# any cast count in api/routes/mcp
HEAD: ~24
Working tree: ~8
```

Remaining `any` casts are in flow function return types and Option type narrowing, which are structural issues unrelated to MCP input handling.
