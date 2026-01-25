# @liexp/shared

**Version:** 0.2.2
**Location:** `packages/@liexp/shared`

## Purpose

The central package for shared business logic, API endpoint definitions, helper functions, and service providers. It bridges the `@liexp/io` domain types with service implementations.

## Key Modules

### 1. API Endpoints (`src/endpoints/`)

Type-safe endpoint definitions using `@ts-endpoint/core` for contract-first API development.

```typescript
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
```

#### Available Endpoint Groups

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

### 2. API Provider (`src/providers/api/`)

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

### 3. HTTP Provider (`src/providers/http/`)

Low-level HTTP client wrapper with error handling.

```typescript
import { HTTPProvider, HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";

const http = HTTPProvider(axiosInstance);

// Returns TaskEither<HTTPError, T>
const data = await http.get<ResponseType>("/path")();
const result = await http.post<RequestType, ResponseType>("/path", body)();
```

### 4. Event Helpers (`src/helpers/event/`)

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

### 5. BlockNote Providers (`src/providers/blocknote/`)

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

### 6. OpenAI Provider (`src/providers/openai/`)

OpenAI client configuration and prompt templates.

```typescript
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";

const openai = GetOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
});
```

## Development Commands

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

## Related Documentation

- [@liexp/io](./io.md) - Domain types used by this package
- [API Service](../services/api.md) - Service implementing these endpoints
