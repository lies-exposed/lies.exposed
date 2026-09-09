# HOM-46: Migrate TypeORM from v0.3 to v1

## Summary

Migrated TypeORM from v0.3.31 to v1.0 across the Lies Exposed monorepo.

## Changes Made

### Core Changes
- **Import renames**: `PostgresConnectionOptions` → `PostgresDataSourceOptions` in `database.provider.ts`
- **Property rename**: `e.connection` → `e.dataSource` in transaction block
- **Removed `loadRelationCountAndMap`**: Replaced with correlated sub-query in `upsertPinnedMessage.flow.ts`
- **Version bumps**: Updated typeorm in `packages/@liexp/backend/package.json`, `services/api/package.json`, `services/worker/package.json`

### String Relations → Object Syntax
Converted ~70 occurrences of string-based `relations` arrays to object syntax across the codebase:
- `relations: ["avatar"]` → `relations: { avatar: true }`
- `relations: ["actor", "relatedActor"]` → `relations: { actor: true, relatedActor: true }`
- `relations: ["memberIn", "memberIn.group"]` → `relations: { memberIn: { group: true } }`
- Applied to controllers, flows, queries, and test files

### String Select → Object Syntax
Converted 4 occurrences of string-based `select` arrays:
- `select: ["id", "fullName", "avatar"]` → `select: { id: true, fullName: true, avatar: true }`

### Removed Deprecated APIs
- Removed `printSql()` call from `takeLinkScreeenshot.subscriber.ts` (removed in TypeORM v1)

### TypeORM v1 Compatibility Fixes
- **Fixed `invalidWhereValuesBehavior`**: TypeORM v1 defaults to throwing on undefined/null values in where clauses. Updated `queueList.controller.ts` to build where clause dynamically, only including defined filter values.
- **Fixed `dataSource.destroy()`**: Added `isInitialized` guard before calling `destroy()` to prevent `CannotExecuteNotConnectedError` when initialization fails.

### Storybook Restorations
- Restored `EventsNetworkGraphBox.stories.tsx` with updated imports and Vite-compatible Storybook setup
- Fixed `HierarchyNetworkGraphBox.stories.tsx` (codemod corrupted relations lines)

### Test & Build Fixes
- Removed `pglite-datasource.ts` test utility (no longer needed)
- Fixed prettier indentation in worker service files
- Updated e2e test files for new relations syntax
- Fixed MediaEntity type conversion in listGroups.e2e.ts
- Replaced `redisMock.mockClear()` with `vi.clearAllMocks()` in testSetup.ts
- Fixed sharp.toBuffer() mock in generateThumbnail.subscriber.e2e.ts

### Prettier Formatting Fixes
- Fixed prettier formatting in `createFlowGraph.flow.ts` (indentation and unnecessary type assertion)
- Added eslint-disable comment for necessary type assertion in fp-ts pipe

### Files Modified
- **packages/@liexp/backend**: database.provider.ts, buildActorRelationTree.flow.ts, parseURL.flow.ts, upsertPinnedMessage.flow.ts, extractRelationsFromText.flow.ts, validateStoryPublish.flow.ts, data-source.spec.ts
- **packages/@liexp/ui**: AutocompleteEventInput.tsx, ActorTemplate.tsx, EventsFlowGraphFormTab.tsx, EventsNetworkGraphFormTab.tsx
- **services/api**: 30+ controller files, flow files, test files, migration files
- **services/worker**: backfill-link-publish-dates.ts, processOpenAIJobsDone.job.ts, takeLinkScreeenshot.subscriber.ts, update-event-payload-url-refs.ts
- **services/storybook**: EventsNetworkGraphBox.stories.tsx, HierarchyNetworkGraphBox.stories.tsx
- **Test files**: mergeActor.e2e.ts, mergeEvents.e2e.ts, validateStoryPublish.flow.spec.ts

### Not Changed (still compatible)
- `loadRelationIds` and `loadAllRelationIds` relations arrays (still accept string arrays in v1.0)
- Migration files (use stable QueryRunner API)
- Test setup files

## Verification

All three packages build successfully:
- `pnpm --filter @liexp/backend run build` ✅
- `pnpm --filter api run build` ✅
- `pnpm --filter worker run build` ✅

API lint passes (0 errors, 37 pre-existing warnings).

Co-Authored-By: Paperclip <noreply@paperclip.ing>
