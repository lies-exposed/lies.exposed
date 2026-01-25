# API Service

**Location:** `services/api`
**Version:** 0.2.2

## Purpose

The API service is the core REST API backend that:
- Serves all data resources (Actors, Groups, Events, Media, Links, etc.)
- Handles authentication and authorization via JWT
- Manages database operations through TypeORM
- Provides queue management for AI processing jobs
- Exposes MCP (Model Context Protocol) endpoints for AI tool access
- Orchestrates communication between frontend clients and backend services

## Architecture

**Entry Point:** `services/api/src/run.ts`

The service bootstraps by:
1. Loading environment configuration
2. Initializing the `ServerContext` with all providers
3. Creating the Express application
4. Seeding nation data
5. Starting the HTTP server

### Directory Structure

```
services/api/
├── src/
│   ├── app/           # Express application factory
│   ├── context/       # ServerContext type definition
│   ├── routes/        # Route handlers by resource
│   ├── flows/         # Business logic flows
│   └── migrations/    # TypeORM database migrations
├── test/              # Tests
└── build/             # Build output
```

### ServerContext

```typescript
type ServerContext = ENVContext &
  JWTProviderContext &
  DatabaseContext &
  LoggerContext &
  SpaceContext &
  FSClientContext &
  HTTPProviderContext &
  WikipediaProviderContext &
  NERProviderContext &
  URLMetadataContext &
  ConfigContext &
  QueuesProviderContext &
  BlockNoteContext &
  GeocodeProviderContext &
  RedisContext & {
    rw: WikipediaProvider;  // RationalWiki Provider
  };
```

## API Endpoints

### Core Resources

| Resource | Path | Operations |
|----------|------|------------|
| Actors | `/v1/actors` | CRUD, merge, link/unlink events |
| Groups | `/v1/groups` | CRUD, member management |
| Events | `/v1/events` | CRUD, merge, search |
| Media | `/v1/media` | CRUD, upload, thumbnails |
| Links | `/v1/links` | CRUD, metadata extraction |
| Keywords | `/v1/keywords` | CRUD |
| Areas | `/v1/areas` | CRUD, geocoding |
| Stories | `/v1/stories` | CRUD |
| Pages | `/v1/pages` | CRUD |
| Projects | `/v1/projects` | CRUD |
| Users | `/v1/users` | Auth, profile management |
| Queues | `/v1/queues` | AI job queue management |
| Stats | `/v1/stats` | Platform statistics |

### Specialized Event Endpoints

| Endpoint | Description |
|----------|-------------|
| `/v1/deaths` | Death events |
| `/v1/scientific-studies` | Scientific study events |
| `/v1/patents` | Patent events |
| `/v1/documentaries` | Documentary events |
| `/v1/transactions` | Transaction events |
| `/v1/quotes` | Quote events |
| `/v1/books` | Book events |

## MCP Integration

The API service implements an MCP server (`/src/routes/mcp/`) that exposes tools for AI agents:

```typescript
// Registered MCP Tools
registerActorTools(server, ctx);
registerAreaTools(server, ctx);
registerGroupTools(server, ctx);
registerMediaTools(server, ctx);
registerEventTools(server, ctx);
registerLinkTools(server, ctx);
registerNationTools(server, ctx);
registerBlockNoteTools(server);
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret for JWT signing |
| `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_DATABASE` | PostgreSQL connection |
| `DB_SSL_MODE`, `DB_SSL_CERT_PATH` | SSL configuration |
| `SPACE_*` | S3-compatible storage configuration |
| `REDIS_HOST`, `REDIS_CONNECT` | Redis connection |
| `SERVER_HOST`, `SERVER_PORT` | HTTP server binding |
| `WEB_URL` | Frontend URL for CORS and links |
| `GEO_CODE_BASE_URL`, `GEO_CODE_API_KEY` | Geocoding service |

## Development Commands

```bash
# From repo root
pnpm --filter api dev           # Start development server with watch
pnpm --filter api build         # Compile TypeScript
pnpm --filter api test          # Run all tests
pnpm --filter api test:e2e      # Run e2e tests
pnpm --filter api test:spec     # Run unit tests
pnpm --filter api migration:run # Run database migrations
pnpm --filter api migration:gen # Generate new migration

# From services/api directory
pnpm dev
pnpm migration:run
```

## Testing

See [E2E Tests](../testing/e2e-tests.md) for API testing patterns.
