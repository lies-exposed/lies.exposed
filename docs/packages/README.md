# Shared Packages Documentation

This document covers the shared packages in the lies.exposed monorepo that provide core utilities, domain models, and testing infrastructure.

## Table of Contents

1. [@liexp/core](#liexpcore---core-utilities-and-configurations)
2. [@liexp/shared](#liexpshared---domain-models-api-definitions-business-logic)
3. [@liexp/io](#liexpio---http-schemas-and-domain-types)
4. [@liexp/test](#liexptest---testing-utilities-and-configurations)
5. [@liexp/backend](#liexpbackend---backend-utilities)

---

## @liexp/core - Core Utilities and Configurations

**Version:** 0.1.4
**Location:** `packages/@liexp/core`

### Purpose

The foundation package providing core utilities, configurations, and shared functionality used across all packages and services. It establishes consistent patterns for logging, functional programming utilities, environment handling, ESLint configurations, and Vite build tooling.

### Key Modules

#### 1. Logger (`src/logger/`)

A structured logging system built on the `debug` package with consistent log level support.

**Exports:**
- `GetLogger(name: string): Logger` - Factory function to create a namespaced logger
- `Logger` interface with `debug`, `info`, `warn`, `error`, and `test` log levels
- `FPTSLogger` interface for fp-ts integration

**Usage Example:**
```typescript
import { GetLogger } from "@liexp/core/lib/logger/index.js";

const logger = GetLogger("api");
logger.info.log("Server started on port %d", 3000);
logger.error.log("Failed to connect: %O", error);

// Extend for sub-modules
const dbLogger = logger.extend("database");
dbLogger.debug.log("Query executed: %s", query);
```

**Log Levels:**
- `debug` - Detailed debugging information
- `info` - General operational information
- `warn` - Warning conditions
- `error` - Error conditions
- `test` - Test-specific logging

#### 2. Functional Programming Utilities (`src/fp/`)

A curated re-export of fp-ts modules with additional utilities for functional programming patterns.

**Main Export:**
```typescript
import { fp, pipe, flow } from "@liexp/core/lib/fp/index.js";
```

**Available fp-ts Modules:**
| Alias | Module | Purpose |
|-------|--------|---------|
| `fp.A` | `ReadonlyArray` | Immutable array operations |
| `fp.E` | `Either` | Error handling with left/right values |
| `fp.O` | `Option` | Optional value handling |
| `fp.TE` | `TaskEither` | Async operations with error handling |
| `fp.T` | `Task` | Async operations |
| `fp.RTE` | `ReaderTaskEither` | Dependency injection with async error handling |
| `fp.Map` | `Map` | Immutable Map operations |
| `fp.NEA` | `NonEmptyArray` | Non-empty array operations |
| `fp.R` | `Reader` | Dependency injection |
| `fp.Rec` | `Record` | Record/object operations |
| `fp.S` | `string` | String utilities and Eq |
| `fp.N` | `number` | Number utilities and Ord |
| `fp.IO` | `IO` | Synchronous side effects |
| `fp.IOE` | `IOEither` | Synchronous side effects with errors |
| `fp.Ord` | `Ord` | Ordering and comparison |
| `fp.Eq` | `Eq` | Equality comparison |
| `fp.Json` | `Json` | JSON parsing utilities |
| `fp.Void` | `void` | Void type utilities |
| `fp.Date` | `Date` | Date comparison and ordering |
| `sequenceS` | Apply | Parallel sequencing for structs |
| `sequenceT` | Apply | Parallel sequencing for tuples |

**Custom Utilities (`fp.Utils`):**

- **`fp.Utils.A.groupBy`** - Group array elements by equality
- **`fp.Utils.O.fromNonEmptyArray`** - Convert non-empty array to Option
- **`fp.Utils.NEA.isNonEmpty`** - Type guard for non-empty arrays
- **`fp.Utils.NEA.nonEmptyArrayOr`** - Return array or fallback value

**Usage Example:**
```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";

const processData = pipe(
  fp.RTE.Do,
  fp.RTE.bind("users", () => fetchUsers()),
  fp.RTE.bind("events", ({ users }) => fetchEventsForUsers(users)),
  fp.RTE.map(({ users, events }) => mergeData(users, events)),
  fp.RTE.mapLeft(toAPIError)
);
```

#### 3. Environment Configuration (`src/env/`)

Effect-based environment schema definitions and utilities.

**Node Environment Schema:**
```typescript
import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";

// Type: "development" | "test" | "production"
const env = Schema.decodeUnknownSync(NODE_ENV)(process.env.NODE_ENV);
```

**Environment Loading (`src/env/utils.ts`):**
```typescript
import { loadENV } from "@liexp/core/lib/env/utils.js";

loadENV(cwd, dotEnvFilePath, validate);
```

#### 4. ESLint Configurations (`src/eslint/`)

Pre-configured ESLint setups for TypeScript projects.

**Base Configuration (`base.config.ts`):**
- ESLint recommended rules
- TypeScript ESLint with type-checked rules
- Prettier integration
- fp-ts plugin with best practices
- Import ordering and organization
- Consistent type imports

**React Configuration (`react.config.ts`):**
- Extends base configuration
- React-specific linting rules
- JSX/TSX support

**Key Rules Enforced:**
- `no-console: "error"` - Prevents console usage (use logger instead)
- Import ordering with alphabetization
- Consistent type-only imports
- Unused variable detection with `_` prefix exceptions
- No imports from `/src/` paths (must use `/lib/`)

**Usage in Service:**
```javascript
// eslint.config.js
import baseConfig from "@liexp/core/lib/eslint/base.config.js";

export default [
  ...baseConfig,
  // service-specific overrides
];
```

#### 5. Vite Configuration (`src/frontend/vite/`)

Shared Vite configuration factory for frontend services with monorepo HMR support.

**Main Function:**
```typescript
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";

export default defineViteConfig({
  cwd: __dirname,
  envFileDir: __dirname,
  env: EnvSchema,
  target: "spa",
  base: "/",
  output: "build",
  // Optional: monorepoHmr configuration
});
```

**Features:**
- Automatic monorepo root detection
- HMR for package source changes (lib/ -> src/ aliasing)
- Environment validation with Effect schemas
- Pre-configured plugins (React, SVG, CSS injection, tsconfig paths)
- Optimized build settings for development and production
- Deduplication of common dependencies (React, MUI)

### Development Commands

```bash
# Build package
pnpm --filter @liexp/core build

# Type checking
pnpm --filter @liexp/core typecheck

# Watch mode
pnpm --filter @liexp/core watch

# Lint
pnpm --filter @liexp/core lint
```

---

## @liexp/shared - Domain Models, API Definitions, Business Logic

**Version:** 0.2.2
**Location:** `packages/@liexp/shared`

### Purpose

The central package for shared business logic, API endpoint definitions, helper functions, and service providers. It bridges the `@liexp/io` domain types with service implementations.

### Key Modules

#### 1. API Endpoints (`src/endpoints/`)

Type-safe endpoint definitions using `@ts-endpoint/core` for contract-first API development.

**Main Export:**
```typescript
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
```

**Available Endpoint Groups:**

| Endpoint | Resource | Operations |
|----------|----------|------------|
| `Endpoints.Actor` | Actors/People | Get, List, Create, Edit, Delete, Merge, LinkEvents, UnlinkEvent |
| `Endpoints.Group` | Organizations | Get, List, Create, Edit, Delete |
| `Endpoints.GroupMember` | Memberships | CRUD operations |
| `Endpoints.Event` | Generic Events | Get, List, Create, Edit, Delete, Search |
| `Endpoints.BookEvent` | Book Events | CRUD operations |
| `Endpoints.DeathEvent` | Death Events | CRUD operations |
| `Endpoints.PatentEvent` | Patent Events | CRUD operations |
| `Endpoints.QuoteEvent` | Quote Events | CRUD operations |
| `Endpoints.ScientificStudy` | Studies | CRUD operations |
| `Endpoints.DocumentaryEvent` | Documentaries | CRUD operations |
| `Endpoints.TransactionEvent` | Transactions | CRUD operations |
| `Endpoints.Media` | Media Files | CRUD operations |
| `Endpoints.Link` | External Links | CRUD operations |
| `Endpoints.Keyword` | Keywords/Tags | CRUD operations |
| `Endpoints.Area` | Locations | CRUD operations |
| `Endpoints.Story` | Stories | CRUD operations |
| `Endpoints.Graph` | Graph Data | CRUD operations |
| `Endpoints.Page` | Static Pages | CRUD operations |
| `Endpoints.Project` | Projects | CRUD operations |
| `Endpoints.Nation` | Countries | List, Get |
| `Endpoints.User` | Users | Auth, CRUD |
| `Endpoints.Admin` | Admin Ops | Various admin operations |
| `Endpoints.OpenGraph` | Metadata | Get metadata from URLs |
| `Endpoints.Stats` | Statistics | Get stats |
| `Endpoints.Networks` | Network Graphs | Get, Edit |
| `Endpoints.Healthcheck` | Health | Get health status |
| `Endpoints.SocialPosts` | Social Media | CRUD, Publish |
| `Endpoints.Setting` | Settings | CRUD operations |
| `Endpoints.Queues` | Job Queues | CRUD, Process |

#### 2. API Provider (`src/providers/api/`)

Type-safe API client generation from endpoint definitions.

```typescript
import { GetAPIProvider, type API } from "@liexp/shared/lib/providers/api/api.provider.js";
import axios from "axios";

const client = axios.create({ baseURL: "https://api.lies.exposed" });
const api: API = GetAPIProvider(client);

// Fully typed API calls returning TaskEither<APIError, Response>
const result = await api.Actor.List({ Query: { _start: 0, _end: 10 } })();
const actor = await api.Actor.Get({ Params: { id: "uuid-here" } })();
```

#### 3. HTTP Provider (`src/providers/http/`)

Low-level HTTP client wrapper with error handling.

```typescript
import { HTTPProvider, HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";

const http = HTTPProvider(axiosInstance);

// Returns TaskEither<HTTPError, T>
const data = await http.get<ResponseType>("/path")();
const result = await http.post<RequestType, ResponseType>("/path", body)();
```

#### 4. Event Helpers (`src/helpers/event/`)

Business logic utilities for event processing.

| Helper | Purpose |
|--------|---------|
| `EventHelper.getTitle` | Extract display title from any event type |
| `EventHelper.getCommonProps` | Get common properties across event types |
| `EventHelper.transform` | Transform event between types |
| `buildEvent` | Create new event from common props |
| `takeEventRelations` | Extract all relation IDs from events |
| `eventRelationIdsMonoid` | Combine relation IDs with deduplication |
| `eventsDataToNavigatorItems` | Convert events to navigation structure |
| `ordEventDate` | Order events by date |
| `eventsInDateRange` | Filter events within date range |
| `getColorByEventType` | Get UI color for event type |
| `getRelationIds` | Extract relation IDs from single event |

#### 5. BlockNote Providers (`src/providers/blocknote/`)

Rich text editor integration with custom block and inline element definitions.

**Custom Blocks:**
- `EventBlock` - Embed event references
- `MediaBlock` - Embed media content

**Custom Inline Elements:**
- `actorInline` - Inline actor mentions
- `groupInline` - Inline group mentions
- `keywordInline` - Inline keyword tags
- `areaInline` - Inline location references
- `relationInline` - Generic relation links

#### 6. OpenAI Provider (`src/providers/openai/`)

OpenAI client configuration and prompt templates.

```typescript
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";

const openai = GetOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
});
```

### Development Commands

```bash
# Build
pnpm --filter @liexp/shared build

# Run tests
pnpm --filter @liexp/shared test

# Type checking
pnpm --filter @liexp/shared typecheck

# Watch mode
pnpm --filter @liexp/shared watch

# Lint
pnpm --filter @liexp/shared lint
```

---

## @liexp/io - HTTP Schemas and Domain Types

**Version:** 0.2.2
**Location:** `packages/@liexp/io`

### Purpose

The definitive source for all domain model types, HTTP schemas, and data structures used across the platform. Built entirely with Effect schemas for runtime validation and TypeScript type inference.

### Key Modules

#### 1. HTTP Schemas (`src/http/`)

**Domain Entities:**

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

**Event Types (`src/http/Events/`):**

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

**Schema Example:**
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

#### 2. Common Types (`src/http/Common/`)

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

#### 3. Query Types (`src/http/Query/`)

Standardized query parameters for API requests.

```typescript
import { GetListQuery, PaginationQuery, SortQuery, FilterQuery } from "@liexp/io/lib/http/Query/index.js";

// GetListQuery combines pagination, sorting, and filtering
// _start, _end, _sort, _order, q
```

#### 4. Error Types (`src/http/Error/`)

Standardized error handling.

```typescript
import { APIError, toAPIError } from "@liexp/io/lib/http/Error/APIError.js";
import { IOError } from "@liexp/io/lib/http/Error/IOError.js";
```

### Development Commands

```bash
pnpm --filter @liexp/io build
pnpm --filter @liexp/io test
pnpm --filter @liexp/io typecheck
pnpm --filter @liexp/io watch
```

---

## @liexp/test - Testing Utilities and Configurations

**Version:** 0.1.10
**Location:** `packages/@liexp/test`

### Purpose

Provides property-based testing infrastructure using `fast-check` with arbitraries (data generators) for all domain types. Enables consistent test data generation across all services.

### Key Modules

#### 1. Main Exports

```typescript
import { fc, Media, Event, Nation, Arbs } from "@liexp/test/lib/index.js";

// fc is re-exported fast-check
// Arbs contains all arbitrary namespaces
```

#### 2. Entity Arbitraries (`src/arbitrary/`)

| Arbitrary | Type | Description |
|-----------|------|-------------|
| `ActorArb` | `http.Actor.Actor` | Random actor generation |
| `GroupArb` | `http.Group.Group` | Random group generation |
| `MediaArb` | `http.Media.Media` | Random media generation |
| `LinkArb` | `http.Link.Link` | Random link generation |
| `KeywordArb` | `http.Keyword.Keyword` | Random keyword generation |
| `AreaArb` | `http.Area.Area` | Random area generation |
| `NationArb` | `http.Nation.Nation` | Random nation generation |
| `ProjectArb` | `http.Project.Project` | Random project generation |
| `PageArb` | `http.Page.Page` | Random page generation |
| `UserArb` | `http.User.User` | Random user generation |
| `SocialPostArb` | `http.SocialPost.SocialPost` | Random social post generation |
| `GroupMemberArb` | `http.GroupMember.GroupMember` | Random membership generation |

#### 3. Event Arbitraries (`src/arbitrary/events/`)

```typescript
import { getEventArbitrary, EventTypeArb } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";

// Get arbitrary for specific event type
const uncategorizedArb = getEventArbitrary("Uncategorized");
const deathArb = getEventArbitrary("Death");
const quoteArb = getEventArbitrary("Quote");
```

| Arbitrary | Event Type |
|-----------|------------|
| `BookEventArb` | Book events |
| `DeathEventArb` | Death events |
| `DocumentaryEventArb` | Documentary events |
| `PatentEventArb` | Patent events |
| `QuoteEventArb` | Quote events |
| `ScientificStudyArb` | Scientific study events |
| `TransactionEventArb` | Transaction events |
| `UncategorizedArb` | Generic events |

#### 4. Common Arbitraries (`src/arbitrary/common/`)

| Arbitrary | Type | Description |
|-----------|------|-------------|
| `UUIDArb` | `UUID` | Valid UUID strings |
| `ColorArb` | `Color` | Hex color codes |
| `BlockNoteDocumentArb` | `BlockNoteDocument` | Rich text documents |
| `BySubjectArb` | `BySubject` | Actor or Group references |

### Usage Examples

**Basic Usage:**
```typescript
import { fc, Arbs } from "@liexp/test/lib/index.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";

// Generate single sample
const actor = fc.sample(ActorArb, 1)[0];

// Property-based test
fc.assert(
  fc.property(ActorArb, (actor) => {
    return actor.fullName.length > 0;
  })
);
```

**In API E2E Tests:**
```typescript
import { fc } from "@liexp/test/lib/index.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";

describe("Media API", () => {
  it("should create media", async () => {
    const [media] = fc.sample(MediaArb, 1);
    const [keyword] = fc.sample(KeywordArb, 1);

    const response = await Test.req
      .post("/v1/media")
      .set(authHeader)
      .send({
        ...media,
        keywords: [keyword.id],
      });

    expect(response.status).toBe(201);
  });
});
```

### Development Commands

```bash
pnpm --filter @liexp/test build
pnpm --filter @liexp/test typecheck
pnpm --filter @liexp/test watch
```

---

## @liexp/backend - Backend Utilities

**Version:** 0.1.10
**Location:** `packages/@liexp/backend`

### Purpose

Provides shared backend utilities, database entities, context definitions, providers, and common flows used by all backend services.

### Key Exports

**Database Entities** (`/src/entities/`):
- `ActorEntity` - People and entities
- `GroupEntity` - Organizations
- `EventV2Entity` - Fact-based events
- `MediaEntity` - Images, videos, documents
- `LinkEntity` - Web references
- `KeywordEntity` - Tags and keywords
- `AreaEntity` - Geographic locations
- `StoryEntity` - Narrative articles
- `UserEntity` - User accounts
- `SocialPostEntity` - Social media posts
- `PageEntity` - Static pages
- `ProjectEntity` - Projects
- `SettingEntity` - Application settings
- `NationEntity` - Countries

**Context Providers** (`/src/context/`):
- `DatabaseContext` - TypeORM database access
- `LoggerContext` - Structured logging
- `FSClientContext` - File system operations
- `SpaceContext` - S3-compatible storage
- `RedisContext` - Redis client
- `JWTProviderContext` - JWT authentication
- `PuppeteerProviderContext` - Browser automation
- `PDFProviderContext` - PDF processing
- `FFMPEGProviderContext` - Video processing
- `URLMetadataContext` - URL metadata extraction
- `BraveContext` - Brave search API

**Service Providers** (`/src/providers/`):
- `WikipediaProvider` - Wikipedia API integration
- `TGBotProvider` - Telegram bot
- `IGProvider` - Instagram API
- `NERProvider` - Named Entity Recognition
- `GeocodeProvider` - Geocoding services
- `ImgProcClient` - Image processing (Sharp)
- `QueueProvider` - File-based job queue

**Express Middleware** (`/src/express/`):
- `authenticationHandler` - JWT/permission validation
- `auditMiddleware` - Request logging
- `rateLimitFactory` - Rate limiting

**Flows** (`/src/flows/`):
- Admin NLP flows
- Area editing flows
- Event extraction flows
- File system flows
- Link processing flows
- Media processing flows

**Services** (`/src/services/`):
- `AgentChatService` - AI agent communication
- `LoggerService` - Logging utilities

### Development Commands

```bash
pnpm --filter @liexp/backend build
pnpm --filter @liexp/backend test
pnpm --filter @liexp/backend typecheck
pnpm --filter @liexp/backend watch
```

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                        Services                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   API   │  │ AI-Bot  │  │ Worker  │  │   Web   │ ...    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │               │
└───────┼────────────┼────────────┼────────────┼───────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      @liexp/shared                           │
│  (Endpoints, Helpers, Providers, Business Logic)            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        @liexp/io                             │
│  (Domain Types, HTTP Schemas, Error Types)                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       @liexp/core                            │
│  (Logger, FP Utils, ESLint, Vite Config)                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       @liexp/test                            │
│  (Arbitraries, Test Utils) - devDependency                  │
└─────────────────────────────────────────────────────────────┘
```

## Build Order

When building the monorepo, packages must be built in dependency order:

1. `@liexp/core` (no internal dependencies)
2. `@liexp/io` (depends on @liexp/core)
3. `@liexp/test` (depends on @liexp/core, @liexp/io)
4. `@liexp/shared` (depends on @liexp/core, @liexp/io)
5. `@liexp/backend` (depends on all above)
6. `@liexp/ui` (depends on @liexp/shared)
7. Services (depend on packages)

**Build all packages:**
```bash
# From repository root
pnpm install
pnpm -r build
```

**Build specific package and dependencies:**
```bash
pnpm --filter @liexp/shared... build
```

---

## Common Patterns

### Importing from Packages

Always import from the `lib/` directory (build output):

```typescript
// Correct
import { fp } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { Actor } from "@liexp/io/lib/http/index.js";

// Incorrect (will be caught by ESLint)
import { fp } from "@liexp/core/src/fp/index.js"; // Error
```

### Functional Programming Pattern

All packages follow fp-ts patterns with ReaderTaskEither for dependency injection:

```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";

type Dependencies = {
  api: API;
  logger: Logger;
};

const fetchAndProcess = (id: string): fp.RTE.ReaderTaskEither<Dependencies, Error, Result> =>
  pipe(
    fp.RTE.ask<Dependencies>(),
    fp.RTE.chainTaskEitherK(({ api }) => api.Actor.Get({ Params: { id } })),
    fp.RTE.chainFirst(({ logger }) =>
      fp.RTE.fromIO(() => logger.info.log("Actor fetched"))
    ),
    fp.RTE.map(processActor)
  );
```

### Effect Schema Pattern

Domain types use Effect schemas for validation:

```typescript
import { Schema } from "effect";

const MySchema = Schema.Struct({
  id: UUID,
  name: Schema.String,
  optional: Schema.Union(Schema.String, Schema.Null),
}).annotations({
  title: "MySchema",
  description: "Description for documentation",
});

type MyType = typeof MySchema.Type;

// Validation
const result = Schema.decodeUnknownEither(MySchema)(data);
```

---

*This documentation is maintained alongside the codebase. For implementation details, refer to the source code in `packages/@liexp/`.*
