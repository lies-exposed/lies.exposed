# @liexp/io

**Version:** 0.2.2
**Location:** `packages/@liexp/io`

## Purpose

The definitive source for all domain model types, HTTP schemas, and data structures used across the platform. Built entirely with Effect schemas for runtime validation and TypeScript type inference.

## Key Modules

### 1. HTTP Schemas (`src/http/`)

#### Domain Entities

| Module | Description |
|--------|-------------|
| `Actor.ts` | People/individuals with profiles |
| `Group.ts` | Organizations, companies, governments |
| `GroupMember.ts` | Membership relationships |
| `Link.ts` | External URL references |
| `Media/` | Images, videos, documents |
| `Keyword.ts` | Tags and categories |
| `Area.ts` | Geographic locations |
| `Nation.ts` | Countries |
| `Story.ts` | Curated narratives |
| `Page.ts` | Static content pages |
| `Project.ts` | Research projects |
| `User.ts` | Platform users |
| `SocialPost.ts` | Social media posts |
| `Setting.ts` | Configuration |

#### Event Types (`src/http/Events/`)

| Event Type | Schema | Description |
|------------|--------|-------------|
| `Uncategorized` | Generic event | Freeform events with title, actors, groups |
| `Death` | Death event | Records of deaths |
| `Quote` | Quote event | Attributed quotations |
| `Transaction` | Transaction event | Financial transactions |
| `Patent` | Patent event | Patent filings |
| `Book` | Book event | Book publications |
| `Documentary` | Documentary event | Documentary releases |
| `ScientificStudy` | Study event | Scientific publications |

#### Schema Example

```typescript
// From Actor.ts
export const Actor = Schema.Struct({
  ...BaseProps.fields,
  fullName: Schema.String,
  username: Schema.String,
  avatar: Schema.Union(Media, Schema.Undefined),
  color: Color,
  nationalities: Schema.Array(Schema.Union(Nation, UUID)),
  memberIn: Schema.Array(Schema.Union(UUID, GroupMember)),
  excerpt: Schema.Union(BlockNoteDocument, Schema.Null),
  body: Schema.Union(BlockNoteDocument, Schema.Null),
  bornOn: Schema.Union(Schema.Date, Schema.Undefined),
  diedOn: Schema.Union(Schema.Date, Schema.Undefined),
  death: Schema.Union(UUID, Schema.Undefined),
});
```

### 2. Common Types (`src/http/Common/`)

Shared type definitions used across all schemas.

| Type | Description |
|------|-------------|
| `UUID` | UUID string validation |
| `URL` | URL string validation |
| `Color` | Hex color code |
| `BaseProps` | id, createdAt, updatedAt, deletedAt |
| `BlockNoteDocument` | Rich text document |
| `BySubject` | Actor or Group reference |
| `BoundingBox` | Geographic bounds |
| `Geometry/*` | GeoJSON types (Point, Polygon, Position) |
| `MoneyAmount` | Currency amounts |
| `Impact` | Positive/negative impact |
| `Tag` | Tagging system |
| `Output` | API response wrapper |
| `ListOutput` | Paginated list response |

### 3. Query Types (`src/http/Query/`)

Standardized query parameters for API requests.

```typescript
import { GetListQuery, PaginationQuery, SortQuery, FilterQuery } from "@liexp/io/lib/http/Query/index.js";

// GetListQuery combines pagination, sorting, and filtering
// _start, _end, _sort, _order, q
```

### 4. Error Types (`src/http/Error/`)

Standardized error handling.

```typescript
import { APIError, toAPIError } from "@liexp/io/lib/http/Error/APIError.js";
import { IOError } from "@liexp/io/lib/http/Error/IOError.js";
```

## Usage

```typescript
import { Actor, Event, Media } from "@liexp/io/lib/http/index.js";
import { UUID, URL } from "@liexp/io/lib/http/Common/index.js";
import { Schema } from "effect";

// Type inference
type ActorType = typeof Actor.Type;

// Validation
const result = Schema.decodeUnknownEither(Actor)(data);
```

## Development Commands

```bash
pnpm --filter @liexp/io build
pnpm --filter @liexp/io test
pnpm --filter @liexp/io typecheck
pnpm --filter @liexp/io watch
```

## Related Documentation

- [@liexp/shared](./shared.md) - API endpoints using these schemas
- [@liexp/test](./test.md) - Arbitraries for generating test data
