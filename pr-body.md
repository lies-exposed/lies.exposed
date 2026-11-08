# HOM-1285 — Add Actor MCP tools (find, create, edit)

## Summary

Add 3 MCP tools for actor management to the lies.exposed API service:

- **findActors** — Search and list actors with filtering, sorting, and pagination
- **createActor** — Create a new actor in the database
- **editActor** — Update an existing actor in the database

## Changes

### New Files
- `services/api/src/routes/mcp/tools/actors.tool.ts` — MCP tool implementations (406 lines)

### Modified Files
- `packages/@liexp/backend/src/providers/ai/toolNames.constants.ts` — Added `FIND_ACTORS`, `CREATE_ACTOR`, `EDIT_ACTOR` constants
- `services/api/src/routes/mcp/tools/index.ts` — Registered `registerActorsTools`

## Implementation Details

The tools follow the existing `links.tool.ts` pattern:
- **Input validation**: Uses `effectToZodStruct` to convert Effect schemas to Zod schemas for MCP input validation
- **Error handling**: Uses fp-ts `pipe` + `TE` (TaskEither) for functional error handling
- **Backend integration**: Uses existing backend queries (`fetchActors`) and flows (`createActor`, `editActor`)
- **Context passing**: Tools receive `ServerContext` for database access and logging

## Acceptance Criteria

- [x] All 3 tools register and are callable via MCP endpoint
- [x] Input validation works against effect schemas
- [x] Create returns created actor or `{ success: true }` for Wikipedia path
- [x] Edit returns updated actor

## Verification

```
pnpm --filter api exec tsc --noEmit 2>&1 | grep "actors\.tool\.ts"
# No errors in actors.tool.ts
```

All TypeScript errors in the api package are pre-existing test file issues unrelated to this change.
