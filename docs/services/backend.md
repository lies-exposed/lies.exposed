# Backend Services Documentation

## Overview

The lies.exposed platform consists of four primary backend services that work together to provide a fact-checking and information analysis system. The architecture follows a microservices pattern with clear separation of concerns.

## Architecture Diagram

```
                                    +------------------+
                                    |   Admin Web      |
                                    |   (React Admin)  |
                                    +--------+---------+
                                             |
                                             v
+------------------+              +------------------+              +------------------+
|   Public Web     |   REST API  |     API          |  Redis Pub   |     Worker       |
|   (React SSR)    +------------>|   Service        +------------->|     Service      |
+------------------+              +--------+---------+              +--------+---------+
                                          |                                  |
                                          | MCP Protocol                     |
                                          v                                  |
                                 +------------------+                        |
                                 |     AI-Bot       |<-----------------------+
                                 |     Service      |    Process Queue Jobs
                                 +--------+---------+
                                          |
                                          v
                                 +------------------+
                                 |  Agent Service   |
                                 |  (LangGraph/MCP) |
                                 +------------------+
```

---

## 1. API Service (`services/api`)

**Version**: 0.2.2

### Purpose and Responsibilities

The API service is the core REST API backend that:
- Serves all data resources (Actors, Groups, Events, Media, Links, etc.)
- Handles authentication and authorization via JWT
- Manages database operations through TypeORM
- Provides queue management for AI processing jobs
- Exposes MCP (Model Context Protocol) endpoints for AI tool access
- Orchestrates communication between frontend clients and backend services

### Architecture

**Entry Point**: `services/api/src/run.ts`

The service bootstraps by:
1. Loading environment configuration
2. Initializing the `ServerContext` with all providers
3. Creating the Express application
4. Seeding nation data
5. Starting the HTTP server

**Key Components**:

- **`/src/app/index.ts`**: Express application factory with CORS, JSON parsing, and route mounting
- **`/src/context/context.type.ts`**: ServerContext type definition combining all provider contexts
- **`/src/routes/`**: Route handlers organized by resource type
- **`/src/flows/`**: Business logic flows for complex operations
- **`/src/migrations/`**: TypeORM database migrations

### ServerContext Composition

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

### API Endpoints

The service exposes RESTful endpoints under `/v1/` for:

| Resource | Path | Operations |
|----------|------|------------|
| Actors | `/v1/actors` | CRUD, merge, link/unlink events |
| Groups | `/v1/groups` | CRUD, member management |
| Events | `/v1/events` | CRUD, merge, search, specialized event types |
| Media | `/v1/media` | CRUD, upload, thumbnail generation |
| Links | `/v1/links` | CRUD, metadata extraction |
| Keywords | `/v1/keywords` | CRUD |
| Areas | `/v1/areas` | CRUD, geocoding |
| Stories | `/v1/stories` | CRUD |
| Pages | `/v1/pages` | CRUD |
| Projects | `/v1/projects` | CRUD |
| Users | `/v1/users` | Auth, profile management |
| Queues | `/v1/queues` | AI job queue management |
| Stats | `/v1/stats` | Platform statistics |
| Admin | `/v1/admin/*` | Administrative operations |
| MCP | `/v1/mcp` | Model Context Protocol endpoint |

**Specialized Event Endpoints**:
- `/v1/deaths` - Death events
- `/v1/scientific-studies` - Scientific study events
- `/v1/patents` - Patent events
- `/v1/documentaries` - Documentary events
- `/v1/transactions` - Transaction events
- `/v1/quotes` - Quote events
- `/v1/books` - Book events

### MCP Integration

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

### Environment Variables

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

### Development Commands

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

---

## 2. AI-Bot Service (`services/ai-bot`)

**Version**: 0.1.10

### Purpose and Responsibilities

The AI-Bot service is the AI processing engine that:
- Polls the queue for pending AI jobs
- Processes jobs using OpenAI/LLM models
- Extracts structured data from URLs and text
- Creates and updates events based on AI analysis
- Communicates with the Agent service for LangGraph-based processing

### Architecture

**Entry Point**: `services/ai-bot/src/run.ts`

The service operates as a continuous job processor:
1. Obtains an API token for authentication
2. Waits for the Agent service to be ready
3. Enters a polling loop to process pending queue jobs
4. Uses exponential backoff for retries on failures

**Key Components**:

- **`/src/context.ts`**: ClientContext type definition
- **`/src/flows/processOpenAIQueue.flow.ts`**: Main queue processing logic
- **`/src/flows/ai/jobProcessor.ts`**: Job type router
- **`/src/flows/ai/event/`**: Event extraction flows
- **`/src/services/job-processor/`**: Generic job processing service

### ClientContext Composition

```typescript
type ClientContext = ENVContext &
  AIBotConfigContext &
  HTTPProviderContext &
  PDFProviderContext &
  APIClientContext &
  AgentClientContext &
  FSClientContext &
  PuppeteerProviderContext &
  LoggerContext;
```

### Job Processing Flows

The service processes these job types:

| Job Type | Flow | Description |
|----------|------|-------------|
| `openai-summarize` | `summarizeTextFlow` | Summarize text content |
| `openai-embedding` | `embedAndQuestionFlow` | Create embeddings and Q&A |
| `openai-create-event-from-url` | `createEventFromURLFlow` | Extract event from URL |
| `openai-create-event-from-text` | `createEventFromTextFlow` | Extract event from text |
| `openai-create-event-from-links` | `createEventFromLinksFlow` | Create event from link IDs |
| `openai-update-event` | `updateEventFlow` | Update existing event |

### Event Extraction Flow Example

From `/src/flows/ai/event/createEventFromURL.flow.ts`:

1. Generate JSON Schema for the target event type
2. Construct prompt with schema and URL context
3. Call Agent service for structured output
4. Fetch associated link from database
5. Build event with AI-extracted data and link references
6. Return structured Event object

### Configuration

The service uses a JSON configuration file (`AIBotConfig`):

```typescript
{
  localAi: {
    url: string,        // AI API URL
    apiKey: string,     // API key
    timeout?: number,   // Request timeout
    models?: {          // Model overrides
      chat?: string,
      agent?: string,
      summarization?: string,
      embeddings?: string
    }
  },
  api: {
    url: URL,           // API service URL
    mcp: URL           // MCP endpoint URL
  },
  agent: {
    url: URL           // Agent service URL
  }
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment mode |
| `DEBUG` | Debug namespace filter |
| `API_TOKEN` | Pre-configured API token |
| `AGENT_API_URL` | Agent service URL |
| `AGENT_MODEL` | Default model to use |
| `AGENT_API_KEY` | Agent API key |
| `AGENT_TIMEOUT` | Request timeout |
| `CF_ACCESS_CLIENT_ID` | Cloudflare Access client ID |
| `CF_ACCESS_CLIENT_SECRET` | Cloudflare Access secret |

### Development Commands

```bash
# From repo root
pnpm --filter ai-bot dev        # Start development with watch
pnpm --filter ai-bot build      # Build (tsc + esbuild)
pnpm --filter ai-bot cli:dev    # Run CLI commands

# From services/ai-bot directory
pnpm dev
pnpm build
```

---

## 3. Worker Service (`services/worker`)

**Version**: 0.1.10

### Purpose and Responsibilities

The Worker service handles background automation:
- Runs scheduled cron jobs
- Listens to Redis pub/sub for event-driven tasks
- Enriches entities from Wikipedia
- Manages social media posting (Telegram, Instagram)
- Processes media (thumbnails, transfers)
- Runs NLP entity extraction
- Generates platform statistics

### Architecture

**Entry Point**: `services/worker/src/run.ts`

The service initializes:
1. WorkerContext with all providers
2. Redis subscribers for event handling
3. Cron jobs for scheduled tasks
4. Telegram bot for command handling

**Key Components**:

- **`/src/context/context.ts`**: WorkerContext type definition
- **`/src/jobs/jobs.ts`**: Cron job orchestration
- **`/src/services/subscribers/WorkerSubscribers.ts`**: Redis subscriber setup
- **`/src/flows/`**: Business logic flows
- **`/src/providers/tg/`**: Telegram bot commands
- **`/src/bin/`**: CLI utilities

### WorkerContext Composition

```typescript
type WorkerContext = ENVContext &
  LoggerContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  RedisContext &
  SpaceContext &
  PDFProviderContext &
  HTTPProviderContext &
  PuppeteerProviderContext &
  NERProviderContext &
  ImgProcClientContext &
  FFMPEGProviderContext &
  TGBotProviderContext &
  IGProviderContext &
  QueuesProviderContext &
  GeocodeProviderContext &
  BlockNoteContext &
  URLMetadataContext &
  WikipediaProviderContext & {
    rw: WikipediaProvider;
  };
```

### Cron Jobs

| Job | Schedule Env Var | Description |
|-----|------------------|-------------|
| Social Posting | `SOCIAL_POSTING_CRON` | Post scheduled content to social platforms |
| Temp Folder Cleanup | `TEMP_FOLDER_CLEAN_UP_CRON` | Clean temporary files |
| Process Done Jobs | `PROCESS_DONE_JOB_CRON` | Handle completed AI queue jobs |
| Regenerate Thumbnails | `REGENERATE_MEDIA_THUMBNAILS_CRON` | Regenerate missing thumbnails |

### Redis Subscribers

The worker subscribes to Redis channels for:

| Subscriber | Purpose |
|------------|---------|
| `SearchLinksSubscriber` | Search for links |
| `TakeLinkScreenshotSubscriber` | Capture link screenshots |
| `GenerateThumbnailSubscriber` | Generate media thumbnails |
| `CreateMediaThumbnailSubscriber` | Create specific thumbnails |
| `ExtractMediaExtraSubscriber` | Extract media metadata |
| `TransferFromExternalProviderSubscriber` | Transfer media from external URLs |
| `CreateEventFromURLSubscriber` | Create events from URLs |
| `PostToSocialPlatformsSubscriber` | Post to social media |
| `ExtractEntitiesWithNLPSubscriber` | NLP entity extraction |
| `SearchFromWikipediaSubscriber` | Wikipedia search and creation |
| `CreateEntityStatsSubscriber` | Generate entity statistics |
| `ProcessJobDoneSubscriber` | Handle completed queue jobs |

### Wikipedia Integration Flows

```typescript
// Fetch and create actor from Wikipedia
fetchAndCreateActorFromWikipedia(title: string, wp: WikiProviders)

// Search and create actor from Wikipedia
searchActorAndCreateFromWikipedia(search: string, wp: WikiProviders)

// Similar flows for areas and groups
fetchAndCreateAreaFromWikipedia(title: string, wp: WikiProviders)
fetchGroupFromWikipedia(title: string, wp: WikiProviders)
```

### Social Media Posting

The worker supports posting to:
- **Telegram**: Via `node-telegram-bot-api`
- **Instagram**: Via `instagram-private-api`

```typescript
postToSocialPlatforms({
  id: UUID,
  platforms: { IG: boolean, TG: boolean }
})
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `WEB_URL` | Frontend URL |
| `DB_*` | Database configuration |
| `SPACE_*` | S3 storage configuration |
| `REDIS_HOST`, `REDIS_CONNECT` | Redis configuration |
| `TG_BOT_TOKEN`, `TG_BOT_CHAT`, `TG_BOT_USERNAME` | Telegram bot |
| `TG_BOT_POLLING`, `TG_BOT_BASE_API_URL` | Telegram settings |
| `IG_USERNAME`, `IG_PASSWORD` | Instagram credentials |
| `GEO_CODE_BASE_URL`, `GEO_CODE_API_KEY` | Geocoding |
| `TEMP_FOLDER_CLEAN_UP_CRON` | Cleanup schedule |
| `SOCIAL_POSTING_CRON` | Social posting schedule |
| `PROCESS_DONE_JOB_CRON` | Job processing schedule |
| `REGENERATE_MEDIA_THUMBNAILS_CRON` | Thumbnail schedule |

### CLI Commands

```bash
# From services/worker directory
pnpm bin:run <command>
pnpm bin:generate-thumbnails
pnpm bin:upsert-nlp-entities

# Available CLI commands (in /src/bin/)
# - assign-default-area-featured-image
# - clean-space-media
# - clean-tg-messages
# - create-from-wikipedia
# - create-stats
# - extract-entities-from-url
# - extract-events
# - generate-missing-thumbnails
# - import-from-kmz
# - parse-tg-message
# - set-default-group-usernames
# - share-post-message
# - update-event-payload-url-refs
# - upsert-nlp-entities
# - upsert-tg-pinned-message
```

### Development Commands

```bash
# From repo root
pnpm --filter worker dev        # Start development with watch
pnpm --filter worker build      # Compile TypeScript
pnpm --filter worker test       # Run tests
pnpm --filter worker test:e2e   # Run e2e tests

# From services/worker directory
pnpm dev
pnpm build
```

---

## 4. Agent Service (`services/agent`)

**Version**: 0.1.10

### Purpose and Responsibilities

The Agent service is the LLM-powered conversational AI engine that:
- Provides chat-based interactions with LangChain/LangGraph
- Supports multiple AI providers (OpenAI, Anthropic, xAI)
- Integrates with MCP (Model Context Protocol) for tool access
- Streams responses via Server-Sent Events (SSE)
- Manages conversation history and context

### Architecture

**Entry Point**: `services/agent/src/run.ts`

The service operates as an Express HTTP server with:
1. JWT authentication for protected routes
2. LangChain agent with MCP tool integration
3. Streaming chat endpoints for real-time responses
4. Conversation management (in-memory, configurable for persistence)

**Key Components**:

- **`/src/app/make.ts`**: Express application factory
- **`/src/context/context.type.ts`**: AgentContext type definition
- **`/src/flows/chat/chat.flow.ts`**: Chat processing logic
- **`/src/routes/chat/chat.controller.ts`**: HTTP route handlers
- **`/src/cli/`**: CLI tools for agent interaction

```
services/agent/
├── src/
│   ├── app/              # Express app setup
│   │   └── make.ts
│   ├── cli/              # CLI commands
│   │   ├── cli.ts
│   │   └── agent.command.ts
│   ├── context/          # Context definition
│   │   ├── context.type.ts
│   │   └── load.ts
│   ├── flows/            # Business logic
│   │   └── chat/
│   │       └── chat.flow.ts
│   ├── io/               # Environment schemas
│   │   └── ENV.ts
│   ├── routes/           # HTTP routes
│   │   ├── index.ts
│   │   ├── route.types.ts
│   │   └── chat/
│   │       └── chat.controller.ts
│   └── run.ts            # Entry point
└── test/                 # Tests
```

### AgentContext Composition

```typescript
type AgentContext = ENVContext &
  LoggerContext &
  JWTProviderContext &
  HTTPProviderContext &
  LangchainContext &
  PuppeteerProviderContext &
  AgentProviderContext;
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat` | POST | Send a chat message (returns full response) |
| `/v1/chat/stream` | POST | Send a chat message (SSE streaming) |
| `/v1/chat/conversations` | GET | List all conversations |
| `/v1/chat/conversations/:id` | GET | Get conversation by ID |
| `/v1/chat/conversations/:id` | DELETE | Delete a conversation |
| `/healthcheck` | GET | Health check endpoint |

### Chat Flow

The chat flow (`chat.flow.ts`) handles:

1. **Message Processing**: Enhances user messages with resource context
2. **Agent Invocation**: Calls LangChain agent with conversation thread
3. **Tool Execution**: Executes MCP tools when needed
4. **Response Streaming**: Yields SSE events for real-time UI updates

```typescript
// Streaming events
type ChatStreamEvent =
  | { type: "message_start"; message_id: string; role: string }
  | { type: "content_delta"; content: string; message_id: string }
  | { type: "tool_call_start"; tool_call: { id: string; name: string; arguments: string } }
  | { type: "tool_call_end"; tool_call: { id: string; name: string; result: string } }
  | { type: "message_end"; message_id: string; content: string }
  | { type: "error"; error: string }
```

### LangChain Integration

The service uses LangChain for:

- **@langchain/openai**: OpenAI model support
- **@langchain/anthropic**: Anthropic Claude support
- **@langchain/xai**: xAI Grok support
- **@langchain/mcp-adapters**: MCP tool integration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment mode |
| `DEBUG` | Debug namespace filter |
| `JWT_SECRET` | JWT signing secret |
| `SERVER_HOST`, `SERVER_PORT` | HTTP server binding |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `XAI_API_KEY` | xAI API key |
| `DEFAULT_MODEL` | Default LLM model to use |
| `MCP_SERVER_URL` | MCP server endpoint (API service) |

### Development Commands

```bash
# From repo root
pnpm --filter agent dev        # Start development with watch
pnpm --filter agent build      # Compile TypeScript
pnpm --filter agent test       # Run all tests
pnpm --filter agent test:spec  # Run unit tests
pnpm --filter agent test:e2e   # Run e2e tests
pnpm --filter agent cli:dev    # Run CLI commands

# From services/agent directory
pnpm dev
pnpm build
```

### CLI Usage

```bash
# Interactive chat with the agent
pnpm cli:dev agent --message "What events happened in 2023?"

# With specific model
pnpm cli:dev agent --model "gpt-4o" --message "Summarize recent news"
```

---

## Queue System

The platform uses a file-based queue system for AI processing jobs.

### Queue Types

```typescript
type QueueTypes =
  | "openai-embedding"
  | "openai-summarize"
  | "openai-create-event-from-url"
  | "openai-create-event-from-text"
  | "openai-create-event-from-links"
  | "openai-update-event"
```

### Queue Status Flow

```
pending -> processing -> done -> completed
                    \-> failed
```

### Queue Job Structure

```typescript
interface Queue {
  id: UUID;
  type: QueueTypes;
  resource: QueueResourceNames;
  status: Status;
  question: string | null;
  result: string | null;
  prompt: string | null;
  error: Record<string, any> | null;
  data: CreateQueueData;
}
```

---

## Inter-Service Communication

### API -> Worker (Redis Pub/Sub)

The API service publishes events to Redis channels that the Worker subscribes to:

```typescript
// Example: Trigger media thumbnail generation
ctx.redis.publish("media:thumbnail", JSON.stringify({ mediaId: "..." }));
```

### AI-Bot -> API (REST)

The AI-Bot polls the API for pending queue jobs and updates them:

```typescript
// List pending jobs
ctx.api.Queues.List({ Query: { status: ["pending", "processing"] } })

// Update job status
ctx.api.Queues.Edit({ Params: { id, type, resource }, Body: updatedJob })
```

### AI-Bot -> Agent (REST)

The AI-Bot communicates with the Agent service for LLM processing:

```typescript
ctx.agent.Chat.Create({
  Body: {
    message: promptWithContext,
    conversation_id: null
  }
})
```

---

## Development Setup

### Prerequisites

- Node.js v18+
- pnpm v8+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+

### Quick Start

```bash
# Clone repository
git clone https://github.com/lies-exposed/lies.exposed.git
cd lies.exposed

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure
docker compose up -d db.liexp.dev

# Build all packages
pnpm build

# Run database migrations
pnpm --filter api migration:run

# Start services (in separate terminals)
pnpm --filter api dev
pnpm --filter worker dev
pnpm --filter ai-bot dev
```

### Running Tests

```bash
# API tests
pnpm --filter api test

# Worker tests
pnpm --filter worker test

# Backend package tests
pnpm --filter @liexp/backend test

# Shared package tests
pnpm --filter @liexp/shared test
```

---

## Key Technical Decisions

1. **Functional Programming**: Uses fp-ts and Effect for type-safe composition
2. **Type-Safe APIs**: ts-endpoint for compile-time API contracts
3. **Event Sourcing Ready**: Queue system supports event-driven patterns
4. **MCP Integration**: AI tools exposed via Model Context Protocol
5. **Multi-Provider AI**: Supports OpenAI, Anthropic, and local models
6. **BlockNote Editor**: Rich text using BlockNote for content

---

*This documentation is maintained alongside the codebase. For specific implementation details, refer to the source code in the respective directories.*
