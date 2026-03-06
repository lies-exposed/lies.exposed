# Agent Service

**Location:** `services/agent`
**Version:** 0.1.10

## Purpose

The Agent service is the LLM-powered conversational AI engine that:
- Provides chat-based interactions with LangChain/LangGraph
- Supports multiple AI providers (OpenAI, Anthropic, xAI)
- Integrates with MCP (Model Context Protocol) for tool access
- Streams responses via Server-Sent Events (SSE)
- Manages conversation history and context

## Architecture

**Entry Point:** `services/agent/src/run.ts`

The service operates as an Express HTTP server with:
1. JWT authentication for protected routes
2. LangChain agent with MCP tool integration
3. Streaming chat endpoints for real-time responses
4. Conversation management (in-memory, configurable for persistence)

### Directory Structure

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

### AgentContext

```typescript
type AgentContext = ENVContext &
  LoggerContext &
  JWTProviderContext &
  HTTPProviderContext &
  LangchainContext &
  PuppeteerProviderContext &
  AgentProviderContext;
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat` | POST | Send a chat message (returns full response) |
| `/v1/chat/stream` | POST | Send a chat message (SSE streaming) |
| `/v1/chat/conversations` | GET | List all conversations |
| `/v1/chat/conversations/:id` | GET | Get conversation by ID |
| `/v1/chat/conversations/:id` | DELETE | Delete a conversation |
| `/healthcheck` | GET | Health check endpoint |

## Chat Flow

The chat flow (`chat.flow.ts`) handles:

1. **Message Processing**: Enhances user messages with resource context
2. **Agent Invocation**: Calls LangChain agent with conversation thread
3. **Tool Execution**: Executes MCP tools when needed
4. **Response Streaming**: Yields SSE events for real-time UI updates

### Multi-Provider Support

The agent supports dynamic provider switching per request via the `aiConfig` field in chat requests. When `aiConfig` is provided, the agent factory creates a new agent instance with the requested provider/model. When omitted, the default agent (bootstrapped at startup) is used.

**Supported providers**: `openai`, `anthropic`, `xai`

```typescript
// Request with provider override
{
  "message": "Hello",
  "aiConfig": {
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514"
  }
}
```

**Architecture**:
- `agent.factory.ts` (in `@liexp/backend`) provides `CreateAgentFactory` which returns a function accepting optional `ProviderConfigOverride`
- `chat.flow.ts` calls `getOrCreateAgent(aiConfig)` which either returns the default agent or creates one on demand
- The response includes `usedProvider` with the actual provider/model used

### Streaming Events

```typescript
type ChatStreamEvent =
  | { type: "message_start"; message_id: string; role: string; usedProvider?: { provider: string; model: string } }
  | { type: "content_delta"; content: string; message_id: string; thinking?: boolean }
  | { type: "tool_call_start"; tool_call: { id: string; name: string; arguments: string } }
  | { type: "tool_call_end"; tool_call: { id: string; name: string; result: string } }
  | { type: "message_end"; message_id: string; content: string; usedProvider?: { provider: string; model: string } }
  | { type: "error"; error: string }
```

## LangChain Integration

The service uses LangChain for:

- **@langchain/openai**: OpenAI model support
- **@langchain/anthropic**: Anthropic Claude support
- **@langchain/xai**: xAI Grok support
- **@langchain/mcp-adapters**: MCP tool integration

## Environment Variables

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

## Development Commands

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

## CLI Usage

The agent service exposes actor management commands via CLI, as a lightweight alternative to the MCP server. CLI commands have clean `--flag=value` interfaces, JSON stdout output, and standard exit codes — easy to compose, test, and call from scripts.

Actor commands use a lightweight context (HTTP + env only) — they start instantly without connecting to MCP or loading LangChain.

### Setup

Set the following env vars in `services/agent/.env` (or `.env.local`):

```
API_BASE_URL=http://localhost:3001   # lies.exposed API base URL
API_TOKEN=<your-jwt-token>           # Bearer token for authenticated requests
```

### Actor Commands

| Command | Description |
|---------|-------------|
| `actor-find` | Search actors by name or group |
| `actor-get` | Get a single actor by UUID |
| `actor-create` | Create a new actor |
| `actor-edit` | Edit an existing actor by UUID |

```bash
# From repo root using pnpm workspace filter
pnpm --filter agent cli <command> [options]

# Or after building, directly:
node services/agent/build/cli/cli.js <command> [options]

# Search actors by name
pnpm --filter agent cli actor-find --name=Obama --take=5

# Get actor by ID
pnpm --filter agent cli actor-get --id=<uuid>

# Create actor
pnpm --filter agent cli actor-create --username=barack-obama --fullName="Barack Obama" --bornOn=1961-08-04

# Edit actor
pnpm --filter agent cli actor-edit --id=<uuid> --excerpt="44th President of the United States"

# Show help for any command
pnpm --filter agent cli actor-find --help

# Interactive agent chat (full MCP + LangChain context)
pnpm --filter agent cli agent
```

All commands output JSON to stdout (the API response body) and exit with code 0 on success, 1 on failure.

The CLI coexists with the MCP server — use whichever fits your workflow.

## Related Documentation

- [AI Overview](../ai/README.md) - AI processing architecture
- [API Service](./api.md) - MCP server implementation
