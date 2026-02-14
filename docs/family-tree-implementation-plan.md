# Family Tree Feature — Implementation Plan

## Overview

Add actor-to-actor relationships (parent/child, spouse, partner) with a family tree visualization using `@xyflow/react` and `entitree-flex`.

## Current State

### What exists

| Asset | Location | Notes |
|---|---|---|
| `entitree-flex` v0.4.1 | `package.json` | Layout engine for genealogy trees |
| `EntitreeGraph` prototype | `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/` | Hardcoded demo data, working layout with spouse/sibling/children handles |
| `@xyflow/react` | `packages/@liexp/ui` | Integrated with custom node types (`ActorNode`, `EventNode`, etc.) |
| `GroupMember` entity | `packages/@liexp/backend/src/entities/GroupMember.entity.ts` | Reference pattern for a relationship entity |
| Actor admin tabs | `services/admin/src/pages/actors/ActorEdit.tsx` | Already has "Entitree" and "Flows" tabs |
| Actor public tabs | `packages/@liexp/ui/src/templates/ActorTemplate.tsx` | Has "Flow" and "Hierarchy" tabs |

### What's missing

- No Actor-to-Actor relationship model (only Actor-to-Group via `GroupMember`)
- No database table for actor relations
- No API endpoints for actor relations
- `EntitreeGraph` uses hardcoded demo data, not real actors

---

## Design Decisions

### Single table with type discriminator

One `actor_relation` table with a `type` enum column rather than separate tables per relation type. This keeps the schema simple and extensible.

### Relation types

| Type | Directionality | `actor` column | `relatedActor` column |
|---|---|---|---|
| `PARENT_CHILD` | Directed | Parent | Child |
| `SPOUSE` | Bidirectional | Either partner | Either partner |
| `PARTNER` | Bidirectional | Either partner | Either partner |

`SPOUSE` indicates a marriage/formal union. `PARTNER` indicates an informal or non-marital relationship (e.g. domestic partnership, long-term relationship).

### Siblings are inferred

Siblings share the same parent — they are computed at query time, not stored. This avoids data denormalization and keeps the model clean.

### Tree endpoint

A dedicated `GET /actor-relations/tree/:actorId` endpoint returns the pre-computed entitree-flex-compatible tree map. This avoids multiple round trips from the frontend and keeps the recursive graph-walking logic server-side.

---

## Actionable Implementation Plan

### Phase 1: Backend — Data Model

#### 1.1 Create the `ActorRelationType` enum

**File**: `packages/@liexp/io/src/http/ActorRelation.ts` (new)

Define an Effect Schema enum with values `PARENT_CHILD`, `SPOUSE`, and `PARTNER`.

#### 1.2 Create the IO schema

**File**: `packages/@liexp/io/src/http/ActorRelation.ts`

Schemas to define (follow `GroupMember.ts` pattern):

- `ActorRelationType` — `Schema.Union(Schema.Literal("PARENT_CHILD"), Schema.Literal("SPOUSE"), Schema.Literal("PARTNER"))`
- `CreateActorRelation` — body for POST: `{ actor: UUID, relatedActor: UUID, type: ActorRelationType, startDate: Date, endDate: NullOr(Date), excerpt: NullOr(BlockNoteDocument) }`
- `EditActorRelation` — body for PUT: all fields optional via `OptionFromNullishToNull`
- `ActorRelation` — full entity: `{ ...BaseProps, actor: Actor, relatedActor: Actor, type, startDate, endDate, excerpt }`
- `SingleActorRelationOutput`, `ListActorRelationOutput` — API response wrappers
- `GetListActorRelationQuery` — query params: `actor` (UUID), `type` (optional filter)

Export from `packages/@liexp/io/src/http/index.ts`.

#### 1.3 Create the database entity

**File**: `packages/@liexp/backend/src/entities/ActorRelation.entity.ts` (new)

```
ActorRelationEntity extends DeletableEntity
  - type:          varchar (enum: 'PARENT_CHILD', 'SPOUSE', 'PARTNER')
  - actor:         ManyToOne → ActorEntity (nullable: false)
  - relatedActor:  ManyToOne → ActorEntity (nullable: false)
  - startDate:     timestamptz, nullable
  - endDate:       timestamptz, nullable
  - excerpt:       json, nullable (BlockNoteDocument)
```

Register in the entity index file alongside other entities.

#### 1.4 Update `ActorEntity`

**File**: `packages/@liexp/backend/src/entities/Actor.entity.ts`

Add two `OneToMany` relations:

```typescript
@OneToMany(() => ActorRelationEntity, (r) => r.actor)
relationsAsSource: Relation<ActorRelationEntity[]>;

@OneToMany(() => ActorRelationEntity, (r) => r.relatedActor)
relationsAsTarget: Relation<ActorRelationEntity[]>;
```

#### 1.5 Create database migration

**File**: `services/api/src/migrations/<timestamp>-CreateActorRelation.ts` (new)

SQL:

```sql
CREATE TABLE actor_relation (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        varchar NOT NULL,
  "actorId"   uuid NOT NULL REFERENCES actor(id),
  "relatedActorId" uuid NOT NULL REFERENCES actor(id),
  "startDate" timestamptz,
  "endDate"   timestamptz,
  excerpt     json,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "deletedAt" timestamptz
);

CREATE INDEX idx_actor_relation_actor ON actor_relation("actorId");
CREATE INDEX idx_actor_relation_related ON actor_relation("relatedActorId");
CREATE INDEX idx_actor_relation_type ON actor_relation(type);
```

Add a unique constraint to prevent duplicate relations:

```sql
CREATE UNIQUE INDEX idx_actor_relation_unique
  ON actor_relation("actorId", "relatedActorId", type)
  WHERE "deletedAt" IS NULL;
```

---

### Phase 2: Backend — API Endpoints

#### 2.1 Define endpoints

**File**: `packages/@liexp/shared/src/endpoints/api/actorRelation.endpoints.ts` (new)

Follow `GroupMember.endpoints.ts` pattern:

| Method | Path | Body/Query | Response |
|---|---|---|---|
| GET | `/actor-relations` | `GetListActorRelationQuery` | `ListActorRelationOutput` |
| GET | `/actor-relations/:id` | — | `SingleActorRelationOutput` |
| POST | `/actor-relations` | `CreateActorRelation` | `SingleActorRelationOutput` |
| PUT | `/actor-relations/:id` | `EditActorRelation` | `SingleActorRelationOutput` |
| DELETE | `/actor-relations/:id` | — | `SingleActorRelationOutput` |
| GET | `/actor-relations/tree/:actorId` | `{ depth?: number }` | Tree map JSON |

Register in `packages/@liexp/shared/src/endpoints/api/index.ts`.

#### 2.2 Create API route controllers

**Directory**: `services/api/src/routes/actor-relations/` (new)

Files to create (follow `services/api/src/routes/groups-members/` pattern):

- `listActorRelation.controller.ts` — query with joins on both actor columns, filter by `actor` (either direction for spouse/partner, directed for parent_child) and `type`
- `getActorRelation.controller.ts` — single relation by ID with actor joins
- `createActorRelation.controller.ts` — validate no duplicate, insert
- `editActorRelation.controller.ts` — partial update
- `deleteActorRelation.controller.ts` — soft delete
- `getActorRelationTree.controller.ts` — recursive tree builder (see Phase 2.3)
- `ActorRelation.route.ts` — wire controllers to endpoints

#### 2.3 Tree endpoint logic

`getActorRelationTree.controller.ts` should:

1. Accept `actorId` and optional `depth` (default 3)
2. Recursively query relations up to `depth` generations
3. For each actor found, load their relations
4. Build and return a map keyed by actor ID:

```typescript
{
  [actorId: string]: {
    id: string;
    name: string;
    fullName: string;
    avatar: string | null;
    bornOn: string | null;
    diedOn: string | null;
    children: string[];   // IDs of children
    spouses: string[];    // IDs of spouses
    partners: string[];   // IDs of partners (non-marital)
    siblings: string[];   // IDs of actors sharing a parent
    isSpouse?: boolean;
    isPartner?: boolean;
    isSibling?: boolean;
  }
}
```

Sibling computation: for a given actor, find their parents via `parent_child` relations, then find all other children of those parents.

Register routes in the API router alongside existing routes.

---

### Phase 3: Frontend — Admin UI

#### 3.1 Create react-admin resource for `ActorRelation`

**File**: `services/admin/src/pages/actor-relations/` (new directory)

- `ActorRelationCreate.tsx` — form with: actor autocomplete, relatedActor autocomplete, type select, startDate, endDate, excerpt
- `ActorRelationEdit.tsx` — same form, pre-populated
- `ActorRelationList.tsx` — table with actor names, type, dates

Register as a react-admin resource.

#### 3.2 Add relations tab to Actor edit page

**File**: `services/admin/src/pages/actors/ActorEdit.tsx` (modify)

Add a new "Relations" tab (alongside existing Groups, Events, etc.) that:

- Lists existing relations for this actor (filterable by type)
- Has "Add Parent", "Add Child", "Add Spouse", "Add Partner" buttons
- Each button opens a dialog with an actor autocomplete + date fields
- Pre-fills the `actor` field with the current actor ID and sets the correct `type`

#### 3.3 Add family tree preview to Actor edit page

In the existing "Entitree" tab of `ActorEdit.tsx`:

- Fetch data from `GET /actor-relations/tree/:actorId`
- Pass it to the updated `EntitreeGraph` component (see Phase 4)

---

### Phase 4: Frontend — Family Tree Visualization

#### 4.1 Create `ActorFamilyNode` component

**File**: `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/ActorFamilyNode.tsx` (new)

A custom xyflow node that renders:

- Actor avatar (using existing `ActorListItem` or `ActorChip`)
- Full name
- Birth/death dates
- Colored border matching actor's `color` field
- Dynamic handles based on relationships (copy handle logic from existing `CustomNode.tsx`)

Register as a node type alongside `custom`.

#### 4.2 Create data transformation utility

**File**: `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/toEntitreeMap.ts` (new)

Function: `toEntitreeMap(treeData: ActorRelationTree): EntitreeMap`

- Takes the tree endpoint response
- Returns the map format that `layoutFromMap` expects
- Marks spouse nodes with `isSpouse: true`
- Marks partner nodes with `isPartner: true`
- Marks sibling nodes with `isSibling: true`

#### 4.3 Update `EntitreeGraph` to accept dynamic data

**File**: `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.tsx` (modify)

Changes:

- Accept props: `tree: EntitreeMap`, `rootId: string`, `onNodeClick?: (actorId: string) => void`
- Remove hardcoded `initialTree` and `treeRootId`
- Use `ActorFamilyNode` as the node type
- Add edge styling per relation type:
  - Parent→Child: solid, `#333`
  - Spouse: dashed, `#e91e63`
  - Partner: dashed, `#9c27b0`
  - Sibling: dotted, `#2196f3`
- Keep the TB/LR layout toggle

#### 4.4 Create `ActorFamilyTree` wrapper component

**File**: `packages/@liexp/ui/src/components/actors/ActorFamilyTree.tsx` (new)

Orchestration component that:

1. Takes an `actorId` prop
2. Fetches `GET /actor-relations/tree/:actorId`
3. Transforms response via `toEntitreeMap`
4. Renders `EntitreeGraph` with the data
5. Handles loading/empty/error states

#### 4.5 Integrate into actor pages

**File**: `packages/@liexp/ui/src/templates/ActorTemplate.tsx` (modify)

Replace the existing hierarchy/entitree tab content with `ActorFamilyTree`.

**File**: `services/admin/src/pages/actors/ActorEdit.tsx` (modify)

Same — use `ActorFamilyTree` in the Entitree tab.

---

### Phase 5: Storybook Stories

Stories live in `services/storybook/src/stories/` and follow existing patterns (see `EventsFlowGraph.stories.tsx`, `ActorHierarchicalEdgeBundling.stories.tsx`).

#### 5.1 Static `EntitreeGraph` story (hardcoded data)

**File**: `services/storybook/src/stories/containers/graphs/ActorFamilyTree.stories.tsx` (new)

A story that renders the `EntitreeGraph` component with a realistic hardcoded family tree — no API calls, no providers required. This validates layout, node rendering, and edge styling in isolation.

```typescript
import { EntitreeGraph } from "@liexp/ui/lib/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
```

Stories to export:

- **`ThreeGenerations`** — grandparent → 2 children → 3 grandchildren, 1 spouse per generation. Validates vertical (TB) layout with all relation types.
- **`HorizontalLayout`** — same data, rendered LR. Validates handle positions flip correctly.
- **`SingleCouple`** — minimal tree: 2 actors connected as spouses. Validates the simplest case.
- **`LargeFamily`** — 1 root with 5 children, 2 spouses, siblings inferred. Validates spacing with many nodes.

Each story should wrap in a `Box` with `{ height: 600, width: '100%', position: 'relative' }` since xyflow requires a sized container.

The hardcoded tree data should use realistic actor-like objects:

```typescript
const sampleTree = {
  "root": {
    id: "root",
    name: "John Smith",
    avatar: null,
    bornOn: "1940-03-15",
    diedOn: "2010-11-22",
    children: ["child-1", "child-2"],
    spouses: ["spouse-1"],
  },
  "spouse-1": {
    id: "spouse-1",
    name: "Jane Smith",
    bornOn: "1942-07-08",
    diedOn: null,
    isSpouse: true,
  },
  // ... children, grandchildren
};
```

#### 5.2 Connected `ActorFamilyTree` story (API-backed)

**File**: same file, additional exports

A story that renders the full `ActorFamilyTree` wrapper component with an actor autocomplete input (following the `EventsFlowGraph.stories.tsx` pattern). This requires the storybook API provider to be running.

```typescript
const ConnectedTemplate: StoryFn = () => {
  const [actorId, setActorId] = useState<string | undefined>();
  return (
    <Box style={{ height: "100%", width: "100%", position: "absolute" }}>
      <AutocompleteActorInput
        selectedItems={[]}
        discrete={false}
        onChange={(actors) => setActorId(actors[0]?.id)}
      />
      {actorId && <ActorFamilyTree actorId={actorId} />}
    </Box>
  );
};
```

Export as `ConnectedActorFamilyTreeExample`.

#### 5.3 Edge styling story

Within the same file, a story that focuses on demonstrating the four edge styles:

- Solid line: parent → child
- Dashed line: spouse connection
- Dashed line (purple): partner connection
- Dotted line: sibling connection

Uses a minimal 5-node tree (1 parent, 1 spouse, 1 partner, 1 child, 1 sibling) so all edge types are visible and easy to verify visually.

---

### Phase 6: Testing

#### 6.1 Unit tests

- `toEntitreeMap` transformation: verify tree structure, spouse/sibling flags
- IO schema encoding/decoding round-trips
- Edge styling logic

#### 6.2 API e2e tests

**File**: `services/api/test/actor-relations/` (new directory)

Follow existing e2e test patterns (`GetAppTest()`, `saveUser`, `loginUser`):

- CRUD operations on actor relations
- Duplicate relation prevention (unique constraint)
- Tree endpoint: verify correct traversal and sibling inference
- Auth: verify only authorized users can create/edit/delete

#### 6.3 Component tests

- `ActorFamilyNode` renders actor info correctly
- `EntitreeGraph` renders nodes and edges from tree data
- `ActorFamilyTree` handles loading/empty/error states

---

## File Change Summary

| Action | Path |
|---|---|
| **Create** | `packages/@liexp/io/src/http/ActorRelation.ts` |
| **Modify** | `packages/@liexp/io/src/http/index.ts` (export new schema) |
| **Create** | `packages/@liexp/backend/src/entities/ActorRelation.entity.ts` |
| **Modify** | `packages/@liexp/backend/src/entities/Actor.entity.ts` (add relations) |
| **Modify** | `packages/@liexp/backend/src/entities/index.ts` (register entity) |
| **Create** | `services/api/src/migrations/<timestamp>-CreateActorRelation.ts` |
| **Create** | `packages/@liexp/shared/src/endpoints/api/actorRelation.endpoints.ts` |
| **Modify** | `packages/@liexp/shared/src/endpoints/api/index.ts` (register endpoints) |
| **Create** | `services/api/src/routes/actor-relations/ActorRelation.route.ts` |
| **Create** | `services/api/src/routes/actor-relations/listActorRelation.controller.ts` |
| **Create** | `services/api/src/routes/actor-relations/getActorRelation.controller.ts` |
| **Create** | `services/api/src/routes/actor-relations/createActorRelation.controller.ts` |
| **Create** | `services/api/src/routes/actor-relations/editActorRelation.controller.ts` |
| **Create** | `services/api/src/routes/actor-relations/deleteActorRelation.controller.ts` |
| **Create** | `services/api/src/routes/actor-relations/getActorRelationTree.controller.ts` |
| **Modify** | `services/api/src/routes/index.ts` (register routes) |
| **Create** | `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/ActorFamilyNode.tsx` |
| **Create** | `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/toEntitreeMap.ts` |
| **Modify** | `packages/@liexp/ui/src/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.tsx` |
| **Create** | `packages/@liexp/ui/src/components/actors/ActorFamilyTree.tsx` |
| **Modify** | `packages/@liexp/ui/src/templates/ActorTemplate.tsx` |
| **Modify** | `services/admin/src/pages/actors/ActorEdit.tsx` |
| **Create** | `services/storybook/src/stories/containers/graphs/ActorFamilyTree.stories.tsx` |
| **Create** | `services/api/test/actor-relations/*.spec.ts` |

## Implementation Order

```
Phase 1 (1.1 → 1.5)  — can be done in one pass, no external dependencies
      ↓
Phase 2 (2.1 → 2.3)  — depends on Phase 1 schemas and entity
      ↓
Phase 3 + 4 + 5 in parallel:
  Phase 3 (3.1 → 3.3) — admin CRUD UI
  Phase 4 (4.1 → 4.5) — family tree visualization
  Phase 5 (5.1 → 5.3) — storybook stories (5.1 can start as soon as Phase 4.1-4.3 are done)
      ↓
Phase 6              — tests across all layers
```
