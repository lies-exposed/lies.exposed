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
