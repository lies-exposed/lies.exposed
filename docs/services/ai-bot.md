# AI-Bot Service

**Location:** `services/ai-bot`
**Version:** 0.1.10

## Purpose

The AI-Bot service is the AI processing engine that:
- Polls the queue for pending AI jobs
- Processes jobs using OpenAI/LLM models
- Extracts structured data from URLs and text
- Creates and updates events based on AI analysis
- Communicates with the Agent service for LangGraph-based processing

## Architecture

**Entry Point:** `services/ai-bot/src/run.ts`

The service operates as a continuous job processor:
1. Obtains an API token for authentication
2. Waits for the Agent service to be ready
3. Enters a polling loop to process pending queue jobs
4. Uses exponential backoff for retries on failures

### Directory Structure

```
services/ai-bot/
├── src/
│   ├── context.ts                    # ClientContext definition
│   ├── flows/
│   │   ├── processOpenAIQueue.flow.ts  # Main queue processing
│   │   └── ai/
│   │       ├── jobProcessor.ts         # Job type router
│   │       └── event/                  # Event extraction flows
│   └── services/
│       └── job-processor/              # Generic job processing
├── test/
└── build/
```

### ClientContext

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

## Job Processing Flows

| Job Type | Flow | Description |
|----------|------|-------------|
| `openai-summarize` | `summarizeTextFlow` | Summarize text content |
| `openai-embedding` | `embedAndQuestionFlow` | Create embeddings and Q&A |
| `openai-create-event-from-url` | `createEventFromURLFlow` | Extract event from URL |
| `openai-create-event-from-text` | `createEventFromTextFlow` | Extract event from text |
| `openai-create-event-from-links` | `createEventFromLinksFlow` | Create event from link IDs |
| `openai-update-event` | `updateEventFlow` | Update existing event |

### Event Extraction Flow

From `/src/flows/ai/event/createEventFromURL.flow.ts`:

1. Generate JSON Schema for the target event type
2. Construct prompt with schema and URL context
3. Call Agent service for structured output
4. Fetch associated link from database
5. Build event with AI-extracted data and link references
6. Return structured Event object

## Configuration

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

## Environment Variables

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

## Development Commands

```bash
# From repo root
pnpm --filter ai-bot dev        # Start development with watch
pnpm --filter ai-bot build      # Build (tsc + esbuild)
pnpm --filter ai-bot cli:dev    # Run CLI commands

# From services/ai-bot directory
pnpm dev
pnpm build
```

## Related Documentation

- [AI Overview](../ai/README.md) - AI processing architecture
- [OpenAI Schemas](../ai/openai-schemas.md) - Structured output requirements
