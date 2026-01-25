# Services Overview

The lies.exposed platform consists of seven services that work together to provide a fact-checking and information analysis system.

## Architecture

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

## Backend Services

| Service | Description | Documentation |
|---------|-------------|---------------|
| **API** | Core REST API backend with JWT auth, TypeORM, queue management | [api.md](./api.md) |
| **AI-Bot** | AI processing engine for queue jobs and event extraction | [ai-bot.md](./ai-bot.md) |
| **Worker** | Background automation, cron jobs, social media, Wikipedia enrichment | [worker.md](./worker.md) |
| **Agent** | LLM-powered chat service with LangChain/LangGraph and MCP tools | [agent.md](./agent.md) |

## Frontend Services

| Service | Description | Documentation |
|---------|-------------|---------------|
| **Web** | Public-facing SSR application | [web.md](./web.md) |
| **Admin** | Content management interface (react-admin) | [admin.md](./admin.md) |
| **Storybook** | Component library documentation | [storybook.md](./storybook.md) |

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

## Queue System

The platform uses a file-based queue system for AI processing jobs.

### Queue Types

- `openai-embedding` - Create embeddings
- `openai-summarize` - Text summarization
- `openai-create-event-from-url` - Extract event from URL
- `openai-create-event-from-text` - Extract event from text
- `openai-create-event-from-links` - Create event from link IDs
- `openai-update-event` - Update existing event

### Queue Status Flow

```
pending -> processing -> done -> completed
                    \-> failed
```

## Development Commands

All services follow a similar pattern:

```bash
# From repo root
pnpm --filter <service> dev      # Start development server
pnpm --filter <service> build    # Compile TypeScript
pnpm --filter <service> test     # Run tests
pnpm --filter <service> lint     # Lint code

# From service directory
pnpm dev
pnpm build
pnpm test
```

## Next Steps

- [API Service](./api.md) - Core REST API
- [Agent Service](./agent.md) - AI chat capabilities
- [Web Service](./web.md) - Public frontend
