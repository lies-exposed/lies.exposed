# @liexp/backend

**Version:** 0.1.10
**Location:** `packages/@liexp/backend`

## Purpose

Provides shared backend utilities, database entities, context definitions, providers, and common flows used by all backend services.

## Key Exports

### Database Entities (`/src/entities/`)

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

### Context Providers (`/src/context/`)

| Context | Description |
|---------|-------------|
| `DatabaseContext` | TypeORM database access |
| `LoggerContext` | Structured logging |
| `FSClientContext` | File system operations |
| `SpaceContext` | S3-compatible storage |
| `RedisContext` | Redis client |
| `JWTProviderContext` | JWT authentication |
| `PuppeteerProviderContext` | Browser automation |
| `PDFProviderContext` | PDF processing |
| `FFMPEGProviderContext` | Video processing |
| `URLMetadataContext` | URL metadata extraction |
| `BraveContext` | Brave search API |

### Service Providers (`/src/providers/`)

| Provider | Description |
|----------|-------------|
| `WikipediaProvider` | Wikipedia API integration |
| `TGBotProvider` | Telegram bot |
| `IGProvider` | Instagram API |
| `NERProvider` | Named Entity Recognition |
| `GeocodeProvider` | Geocoding services |
| `ImgProcClient` | Image processing (Sharp) |
| `QueueProvider` | File-based job queue |

### Redis Pub/Sub (`/src/providers/redis/`)

The `RedisPubSub` factory creates typed pub/sub channels used to trigger worker actions from the API:

```typescript
// Define a channel (packages/@liexp/backend/src/providers/redis/RedisPubSub.ts)
export const RedisPubSub = <P>(
  channel: string,
  decoder: (input: unknown) => Either<ParseError, P>,
) => ({ channel, publish, subscribe });
```

#### Naming convention

Channels follow `<resource>:<action>` (e.g. `link:search`, `link:take-screenshot`).

#### Channel registry (`/src/pubsub/`)

All pub/sub channel definitions are co-located under `/src/pubsub/<resource>/`:

```
packages/@liexp/backend/src/pubsub/
└── links/
    ├── index.ts                          # Exports LinkPubSub object
    ├── searchLinks.pubSub.ts             # link:search
    ├── takeLinkScreenshot.pubSub.ts      # link:take-screenshot
    └── updateEntitiesFromURL.pubSub.ts   # link:update-entities-from-url
```

The `index.ts` barrel re-exports all channels under a named object:

```typescript
// packages/@liexp/backend/src/pubsub/links/index.ts
const LinkPubSub = {
  SearchLinks: SearchLinksPubSub,
  TakeLinkScreenshot: TakeLinkScreenshotPubSub,
  UpdateEntitiesFromURL: UpdateEntitiesFromURLPubSub,
};
```

#### Adding a new channel

1. Create `packages/@liexp/backend/src/pubsub/<resource>/<name>.pubSub.ts`:

```typescript
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";
import { Schema } from "effect/index";

export const MyActionPubSub = RedisPubSub(
  "<resource>:<action>",
  Schema.decodeUnknownEither(
    Schema.Struct({ id: UUID, /* payload fields */ }),
  ),
);
```

2. Export it from the resource `index.ts`.
3. Create the corresponding worker subscriber (see [Worker Service](../services/worker.md#adding-a-subscriber)).
4. Publish from the API after the triggering operation (using `TE.chainFirst`).

### Express Middleware (`/src/express/`)

- `authenticationHandler` - JWT/permission validation
- `auditMiddleware` - Request logging
- `rateLimitFactory` - Rate limiting

### Flows (`/src/flows/`)

- Admin NLP flows
- Area editing flows
- Event extraction flows
- File system flows
- Link processing flows
- Media processing flows

### Services (`/src/services/`)

- `AgentChatService` - AI agent communication
- `LoggerService` - Logging utilities

## Usage

```typescript
import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { DatabaseContext } from "@liexp/backend/lib/context/index.js";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
```

## Development Commands

```bash
pnpm --filter @liexp/backend build
pnpm --filter @liexp/backend test
pnpm --filter @liexp/backend typecheck
pnpm --filter @liexp/backend watch
```

## Related Documentation

- [API Service](../services/api.md) - Uses these entities and contexts
- [Worker Service](../services/worker.md) - Uses these providers
