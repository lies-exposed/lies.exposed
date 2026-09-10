# HOM-46: Migrate TypeORM from 0.3.31 to 1.0 — Migration Plan

## Overview

This plan covers migrating the Lies Exposed monorepo from TypeORM `0.3.31` to `1.0`. The project uses **PostgreSQL only**, runs on **Node.js >= 26** (satisfies the 20+ requirement), and has ~120+ files importing from `typeorm`.

**Work mode**: Planning only — no code changes in this run.

---

## Step 0: Automated Upgrade (Codemod)

**Run first** — the `@typeorm/codemod` package automates most breaking changes:

```bash
npx @typeorm/codemod v1 src/
```

This handles:
- Import renames (e.g., `ConnectionOptions` → `DataSourceOptions`)
- API replacements (e.g., `findOneById` → `findOneBy`)
- Dependency upgrades in package.json
- Find option syntax updates
- Many other automated fixes

**Dry-run first**: `npx @typeorm/codemod v1 --dry packages/@liexp/backend/src/`

> **Note**: The codemod leaves `TODO` comments for changes it can't automate. We'll address those manually.

---

## Step 1: Dependency Update

### `pnpm-lock.yaml` / `package.json`

Current: `typeorm@0.3.31` (with `pg@8.21.0` and `ioredis@5.10.1` as peer deps)

Update to: `typeorm@1.0.x`

Also check:
- `typeorm-pglite@0.3.4` — verify compatibility with TypeORM 1.0 (may need update or removal)
- Ensure `pg` driver is compatible (TypeORM 1.0 uses `pg` natively for PostgreSQL)

---

## Step 2: Import Path Changes (Automated by Codemod)

### `PostgresConnectionOptions` → `PostgresDataSourceOptions`

**File**: `packages/@liexp/backend/src/providers/orm/database.provider.ts` (line 24, 308)

```typescript
// Before
import { type PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
type DatabaseConnectionOpts = PostgresConnectionOptions;

// After
import { type PostgresDataSourceOptions } from "typeorm/driver/postgres/PostgresDataSourceOptions.js";
type DatabaseConnectionOpts = PostgresDataSourceOptions;
```

### `ObjectId` import

**File**: `packages/@liexp/backend/src/providers/orm/database.provider.ts` (line 19)

```typescript
// Before
import { type ObjectId } from "typeorm";

// After — if actually needed (project doesn't use MongoDB, so this may be removable)
import type { ObjectId } from "mongodb";
```

> **Assessment**: The project uses PostgreSQL only. `ObjectId` is imported as a type in the `Criteria` union but the project doesn't actually use MongoDB. Consider removing it entirely if no MongoDB entities exist.

---

## Step 3: `.connection` → `.dataSource` Property Rename

**File**: `packages/@liexp/backend/src/providers/orm/database.provider.ts` (line 294)

In the `transaction` method, `e.connection` (the QueryRunner's old `.connection` property) must become `e.dataSource`:

```typescript
// Before (line 292-295)
ctx.connection.manager.transaction((e) => {
  const transactionClient = GetDatabaseClient({
    connection: e.connection,  // ← .connection renamed to .dataSource
    logger: ctx.logger,
  });
  return task(transactionClient)();
});

// After
ctx.connection.manager.transaction((e) => {
  const transactionClient = GetDatabaseClient({
    connection: e.dataSource,  // ← renamed
    logger: ctx.logger,
  });
  return task(transactionClient)();
});
```

---

## Step 4: String-Based Relations → Object Syntax

**~15 occurrences** across the backend package. String arrays must become object maps.

**Files affected**:
- `packages/@liexp/backend/src/flows/actor-relations/buildActorRelationTree.flow.ts` (4 occurrences)
- `packages/@liexp/backend/src/flows/areas/editArea.flow.ts` (1 occurrence)
- `packages/@liexp/backend/src/flows/event/createEventFromURL.flow.ts` (1 occurrence)
- `packages/@liexp/backend/src/flows/event/getEventById.flow.ts` (1 occurrence)
- `packages/@liexp/backend/src/flows/event/getEventById.flow.spec.ts` (2 occurrences)
- `packages/@liexp/backend/src/flows/media/thumbnails/generateThumbnails.flow.ts` (1 occurrence)
- `packages/@liexp/backend/src/flows/tg/parseURL.flow.ts` (1 occurrence)
- `packages/@liexp/backend/src/queries/actors/fetchActors.query.ts` (1 occurrence)
- `packages/@liexp/backend/src/queries/events/scientificStudy.query.ts` (1 occurrence)
- `packages/@liexp/backend/src/queries/events/searchEventsV2.query.ts` (1 occurrence)
- `packages/@liexp/backend/src/queries/media/fetchManyMedia.query.ts` (1 occurrence)

**Pattern**:
```typescript
// Before
relations: ["avatar"]

// After
relations: { avatar: true }
```

```typescript
// Before (nested)
relations: ["actor", "relatedActor"]

// After
relations: { actor: true, relatedActor: true }
```

---

## Step 5: String-Based Select → Object Syntax

**~4 occurrences** across the backend package.

**Files affected**:
- `packages/@liexp/backend/src/flows/admin/nlp/extractRelationsFromText.flow.ts` (3 occurrences)
- `packages/@liexp/backend/src/flows/stories/validateStoryPublish.flow.spec.ts` (1 occurrence)
- `packages/@liexp/backend/src/flows/stories/validateStoryPublish.flow.ts` (1 occurrence)

**Pattern**:
```typescript
// Before
select: ["id", "fullName", "avatar"]

// After
select: { id: true, fullName: true, avatar: true }
```

---

## Step 6: `loadRelationCountAndMap` Removal

**File**: `packages/@liexp/backend/src/flows/tg/upsertPinnedMessage.flow.ts` (line 60)

```typescript
// Before
.loadRelationCountAndMap("k.eventCount", "k.events")

// After — use @VirtualColumn decorator or sub-query
// Option A: Add @VirtualColumn to the entity
// Option B: Replace with a sub-query in the QueryBuilder
```

---

## Step 7: Behavioral Changes to Review

### 7a. `invalidWhereValuesBehavior` Default Changed

In v1.0, `null` and `undefined` in `where` conditions now **throw** by default (previously silently ignored).

**Resolution**: Rather than opting the whole datasource back into the lenient
behavior, the `where` criteria are sanitised centrally before they reach
TypeORM. `packages/@liexp/backend/src/utils/sanitizeFindOptions.ts` strips
`undefined` / `null` values (keeping `FindOperator`s such as `IsNull()`,
`Date`s and array values), and `GetDatabaseClient` in
`providers/orm/database.provider.ts` applies it to every
`findOne` / `findOneOrFail` / `find` / `findAndCount` / `count` call. The v1
default (`throw`) is therefore left in place.

Not covered: `update` / `delete` / `softDelete` criteria (no offending call
sites today — add sanitisation there if one appears).

Historical note: an earlier fix added
`invalidWhereValuesBehavior: { null: "sql-null", undefined: "ignore" }` to
`createORMConfig`; that line was removed once the sanitiser landed.

### 7b. `nullable: false` Relations Use INNER JOIN

Relations with `nullable: false` now use `INNER JOIN` instead of `LEFT JOIN`. This is semantically correct and shouldn't break anything unless there are orphaned foreign keys in the database.

**Action**: Verify data integrity — no orphaned FK rows should exist. If any do, they'll be silently excluded from results.

### 7c. Cascade Remove Now Works for One-to-Many

The `cascade: true` / `cascade: ["remove"]` on one-to-many relations now correctly deletes children before the parent. This is a **fix**, not a breaking change, but worth noting:

**Files affected**:
- `packages/@liexp/backend/src/entities/Actor.entity.ts` (lines 35, 51, 57, 63)
- `packages/@liexp/backend/src/entities/Group.entity.ts` (lines 34, 59)

### 7d. `getRepository` on QueryBuilder

**File**: `services/api/src/queries/media/fetchManyMedia.query.ts` (line 55)

```typescript
// Before
.getRepository(MediaEntity)
.createQueryBuilder("media")

// After — use dataSource.getRepository()
dataSource.getRepository(MediaEntity)
.createQueryBuilder("media")
```

---

## Step 8: Migrations

**~70 migration files** in `services/api/src/migrations/`. These use `MigrationInterface` and `QueryRunner` — both still exist in v1.0.

**No changes needed** to migration file content. The `queryRunner.query()` API is unchanged.

However, after upgrading, **run all pending migrations** against a test database to verify they still apply cleanly.

---

## Step 9: Test Setup

**File**: `packages/@liexp/backend/src/test/setup/transactional-db.ts`

Uses `QueryRunner` and `EntityManager` — both still exist in v1.0. The hard-patching approach (replacing `dataSource.manager` with `queryRunner.manager`) should still work, but verify after upgrade.

---

## Step 10: Verification

1. **Type check**: `pnpm -C packages/@liexp/backend run typecheck`
2. **Build**: `pnpm -C packages/@liexp/backend run build`
3. **Test**: `pnpm run vitest` (or equivalent test command)
4. **Run migrations** against a test DB
5. **Integration test**: Start the API service and verify basic operations

---

## Risk Assessment

| Area | Risk | Mitigation |
|------|------|------------|
| Codemod misses something | Medium | Manual review of TODO comments, type check |
| `invalidWhereValuesBehavior` breaking queries | Medium | Audit all find/findOne calls |
| `nullable: false` INNER JOIN excluding orphaned rows | Low | Verify FK integrity in DB |
| `loadRelationCountAndMap` replacement | Medium | Requires sub-query or @VirtualColumn |
| String relations/select conversion | Low | Straightforward find-replace |
| Migration compatibility | Low | Migrations use stable APIs |
| `typeorm-pglite` compatibility | Medium | Check if pglite package supports TypeORM 1.0 |

---

## Execution Order

1. **Run codemod** (`--dry` first, then actual)
2. **Fix import paths** (`PostgresConnectionOptions` → `PostgresDataSourceOptions`)
3. **Fix `.connection` → `.dataSource`** in transaction block
4. **Fix string relations** → object syntax
5. **Fix string select** → object syntax
6. **Fix `loadRelationCountAndMap`** → sub-query or @VirtualColumn
7. **Fix `getRepository`** on QueryBuilder
8. **Review `invalidWhereValuesBehavior`** impact
9. **Update dependencies** in package.json
10. **Type check, build, test**
11. **Run migrations** against test DB

---

## Files Requiring Manual Review (Post-Codemod)

After running the codemod, manually review all files containing `TODO` comments left by the codemod. Key files to watch:

- `packages/@liexp/backend/src/providers/orm/database.provider.ts`
- `packages/@liexp/backend/src/providers/orm/database.provider.ts` (transaction block)
- `packages/@liexp/backend/src/flows/tg/upsertPinnedMessage.flow.ts`
- `packages/@liexp/backend/src/flows/actor-relations/buildActorRelationTree.flow.ts`
- `packages/@liexp/backend/src/queries/media/fetchManyMedia.query.ts`

---

## Notes

- The project already uses Node.js >= 26, satisfying TypeORM 1.0's requirement.
- No MongoDB usage — `ObjectId` type import may be removable.
- No NestJS — no `@nestjs/typeorm` compatibility concerns.
- No IoC container usage — no container system migration needed.
- No `Connection` usage (already using `DataSource`).
- No `printSql()`, `onConflict()`, `setNativeParameters()`, or other removed QueryBuilder methods in active code.
- No `findByIds`, `findOneById`, `exist`, `getMongoRepository`, `getMongoManager`, `getAllMigrations`, `useContainer`, `getFromContainer`, `AbstractRepository`, `@EntityRepository`, `@RelationCount`, `@EntityRepository`, `ConnectionOptionsReader`, or `TYPEORM_*` env var usage.
