# Admin Service

**Location:** `services/admin`

## Purpose

The admin service provides content management capabilities:
- CRUD operations for all platform resources
- AI-assisted content creation and editing
- Queue management for background jobs
- User and permission management
- Dashboard with content statistics
- Integrated AI chat assistant

## Architecture

### Build System

- **Bundler**: Vite 7.x (SPA mode)
- **Framework**: react-admin 5.x
- **TypeScript**: Strict mode with server compilation

### Directory Structure

```
services/admin/
├── src/
│   ├── index.tsx         # Application entry point
│   ├── AdminPage.tsx     # Main admin component with resources
│   ├── theme.ts          # Admin-specific theme overrides
│   ├── configuration/
│   ├── components/
│   │   ├── chat/         # AI chat integration
│   │   └── MergedEventPreview.tsx
│   ├── hooks/
│   │   └── useStreamingChat.ts
│   ├── pages/            # Admin pages by resource
│   │   ├── actors/
│   │   ├── areas/
│   │   ├── events/
│   │   ├── graphs/
│   │   ├── dashboard/
│   │   └── ...
│   └── server/           # Express proxy server
│       ├── server.tsx
│       ├── createApp.ts
│       └── routes/
│           └── agent-proxy.routes.ts
├── docs/                 # Architecture documentation
├── public/
└── test/
```

### State Management

- **react-admin DataProvider**: Primary data operations
- **TanStack Query**: Custom queries and caching
- **AgentAPIContext**: AI service communication

```typescript
// Entry point (src/index.tsx)
<ConfigurationContext.Provider value={configuration}>
  <DataProviderContext.Provider value={APIRESTClient(...)}>
    <AgentAPIContext.Provider value={APIRESTClient(...)}>
      <QueryClientProvider client={new QueryClient()}>
        <AdminPage />
      </QueryClientProvider>
    </AgentAPIContext.Provider>
  </DataProviderContext.Provider>
</ConfigurationContext.Provider>
```

## Resource Management

The admin uses react-admin `Resource` components for CRUD operations:

| Resource | List | Edit | Create | Description |
|----------|------|------|--------|-------------|
| `pages` | Yes | Yes | Yes | CMS pages |
| `stories` | Yes | Yes | Yes | Articles/stories |
| `media` | Yes | Yes | Yes | Multimedia content |
| `links` | Yes | Yes | Yes | External references |
| `actors` | Yes | Yes | Yes | People/entities |
| `groups` | Yes | Yes | Yes | Organizations |
| `areas` | Yes | Yes | Yes | Geographic locations |
| `keywords` | Yes | Yes | Yes | Topics/tags |
| `events` | Yes | Yes | Yes | Main events |
| `books` | Yes | Yes | Yes | Book events |
| `deaths` | Yes | Yes | Yes | Death events |
| `documentaries` | Yes | Yes | Yes | Documentary events |
| `quotes` | Yes | Yes | Yes | Quote events |
| `patents` | Yes | Yes | Yes | Patent events |
| `scientific-studies` | Yes | Yes | Yes | Scientific study events |
| `transactions` | Yes | Yes | Yes | Transaction events |
| `users` | Yes | Yes | Yes | User management |
| `social-posts` | Yes | Yes | Yes | Social media posts |
| `queues` | Yes | - | Yes | Background job queues |
| `graphs` | Yes | Yes | Yes | Network graphs |
| `nations` | Yes | Yes | Yes | Country data |

## AI Chat Integration

The admin includes an AI chat assistant (`components/chat/AdminChat.tsx`):
- Streaming chat with Server-Sent Events
- Context-aware assistance (current resource/record)
- Tool call visualization
- M2M authentication via proxy

## Agent Proxy Server

The admin service includes an Express server that proxies AI agent requests:

```typescript
// Key routes (server/routes/agent-proxy.routes.ts)
POST   /api/proxy/agent/chat/message        # Send chat message
POST   /api/proxy/agent/chat/message/stream # Streaming chat (SSE)
GET    /api/proxy/agent/chat/conversations  # List conversations
GET    /api/proxy/agent/chat/conversations/:id
DELETE /api/proxy/agent/chat/conversations/:id
GET    /api/proxy/agent/health              # Health check
```

Features:
- M2M (Machine-to-Machine) authentication
- Rate limiting per authenticated user
- Request auditing with correlation IDs
- Error handling and mapping

## Configuration

### Environment Variables

```bash
# Node Environment
NODE_ENV=development
DEBUG=@liexp:*

# Frontend Configuration
VITE_NODE_ENV=development
VITE_DEBUG=@liexp:*
VITE_USE_AGENT_PROXY=true  # Enable server-side agent proxy

# URLs
VITE_PUBLIC_URL=http://admin.liexp.dev
VITE_API_URL=http://api.liexp.dev/v1
VITE_WEB_URL=http://liexp.dev
VITE_AGENT_URL=http://agent.liexp.dev/v1
VITE_OPENAI_URL=https://ai.lies.exposed/v1
```

### Server Environment (`.env.server`)

```bash
# Server binding
SERVER_HOST=0.0.0.0
SERVER_PORT=80

# Agent proxy configuration
AGENT_API_URL=http://agent.liexp.dev/v1

# M2M Authentication
M2M_TOKEN_URL=...
M2M_CLIENT_ID=...
M2M_CLIENT_SECRET=...

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Build and Deployment

### NPM Scripts

```bash
# Development
pnpm dev                    # Vite dev server (SPA)
pnpm dev:server             # Server with agent proxy

# Building
pnpm build                  # TypeScript compilation
pnpm build:app              # Vite SPA bundle
pnpm build:server           # Server compilation
pnpm build:app-server       # Full production build

# Testing
pnpm test                   # Run tests
pnpm test:e2e               # E2E tests

# Production
pnpm serve                  # Run production server
```

## Development

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development**
   ```bash
   # SPA only (no agent proxy)
   pnpm --filter admin dev

   # With agent proxy server
   pnpm --filter admin dev:server
   ```

3. **Access Application**
   - Development: `http://admin.liexp.dev`

## Related Documentation

- [UI Package](../packages/ui.md) - Shared React components
- [Agent Service](./agent.md) - AI chat capabilities
- [Web Service](./web.md) - Public frontend
