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

### Streaming Events

```typescript
type ChatStreamEvent =
  | { type: "message_start"; message_id: string; role: string }
  | { type: "content_delta"; content: string; message_id: string }
  | { type: "tool_call_start"; tool_call: { id: string; name: string; arguments: string } }
  | { type: "tool_call_end"; tool_call: { id: string; name: string; result: string } }
  | { type: "message_end"; message_id: string; content: string }
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

```bash
# Interactive chat with the agent
pnpm cli:dev agent --message "What events happened in 2023?"

# With specific model
pnpm cli:dev agent --model "gpt-4o" --message "Summarize recent news"
```

## Related Documentation

- [AI Overview](../ai/README.md) - AI processing architecture
- [API Service](./api.md) - MCP server implementation
