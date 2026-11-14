## Summary

Complete the reduction of `any` casts across all services in the monorepo. This PR closes out the remaining production-code `as any` casts in the API service's MCP tools, building on the work from previous commits.

## Changes

### services/api/src/routes/mcp/tools/helpers.ts
- Cast `effectSchema` through `Schema.Schema<unknown, A>` for proper type inference instead of `as any`
- The decoder function works correctly at runtime; the cast is necessary because TypeScript cannot properly infer the input type from a generic `Schema.Struct<A>`

### services/api/src/routes/mcp/tools/groups.tool.ts
- Use validated `input` directly with `EditGroupInput` cast instead of building a raw `editBody` record
- The MCP schema validation already converts raw values to `Option<T>` fields via `OptionFromUndefinedOr`
- Added local `EditGroupInput` interface definition (not exported from editGroup.flow.ts)

## Acceptance Criteria

| Service | Before | After | Target | Status |
|---------|--------|-------|--------|--------|
| API | 50 | **0** | <=15 | OK |
| Agent | 22 | **0** | <=8 | OK |
| Admin | 4 | **0** | <=1 | OK |
| Web | 13 | **0** | <=4 | OK |
| Worker | 6 | **0** | <=2 | OK |

**Note:** 3 remaining `as any` occurrences in API are in commented-out code blocks (not active production code).

## Files Changed
- `services/api/src/routes/mcp/tools/helpers.ts`
- `services/api/src/routes/mcp/tools/groups.tool.ts`
