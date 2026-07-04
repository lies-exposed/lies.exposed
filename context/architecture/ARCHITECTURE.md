<!-- purpose: System shape, service boundaries, package hierarchy, and data flow. Read this first before touching any service or package. -->
# Architecture

<!-- exodia:section:intro -->
Monorepo with 7 services under `services/` and 6 shared packages under `packages/@liexp/`. All TypeScript, pnpm workspace, deployed to Kubernetes via Helm. Fact-checking and information analysis platform.

## Services

<!-- exodia:section:services -->

| Service | Role | Port |
|---------|------|------|
| `api` | Core REST API: JWT auth, TypeORM/PostgreSQL, queue management, Redis Pub/Sub | 3010 |
| `ai-bot` | AI processing: polls queue, runs OpenAI jobs, event extraction | — |
| `worker` | Background automation: cron, Wikipedia enrichment, social media | — |
| `agent` | LLM chat: LangChain/LangGraph + MCP tools, LocalAI backend | 3030 |
| `web` | Public SSR frontend (React + SSR) | 3000 |
| `admin` | Content management (react-admin) | 3100 |
| `storybook` | Component library documentation | — |

## Package Hierarchy

<!-- exodia:section:packages -->

```
Services
  └─ @liexp/shared   (endpoints, helpers, providers, business logic)
      └─ @liexp/io   (domain types, HTTP schemas, Effect schemas)
          └─ @liexp/core  (logger, fp utils, ESLint, Vite config)
               └─ @liexp/test  (fast-check arbitraries, test utils)

@liexp/backend  (TypeORM entities, backend context, Express middleware)
  └─ @liexp/shared
@liexp/ui  (React components, hooks, design system)
  └─ @liexp/shared
```

Build order: `core` → `io` → `test` → `shared` → `backend` → `ui` → services.

## Data Flow

<!-- exodia:section:dataflow -->

```
Public Web ──REST──► API ──Redis Pub/Sub──► Worker
Admin Web  ──REST──► API ──MCP──────────► AI-Bot ──REST──► Agent
                                                    └──REST──► API (queue updates)
```

- **API → Worker**: Redis channels (e.g. `media:thumbnail`, `actor:update`)
- **AI-Bot → API**: polls `Queues.List`, updates via `Queues.Edit`
- **AI-Bot → Agent**: `ctx.agent.Chat.Create({ Body: { message, conversation_id } })`
- **Agent**: LangGraph flows, MCP tool execution, LocalAI at `ai.lies.exposed`

## Queue System

<!-- exodia:section:queues -->

Queue types: `openai-embedding`, `openai-summarize`, `openai-create-event-from-url`, `openai-create-event-from-text`, `openai-create-event-from-links`, `openai-update-event`.

Status flow: `pending → processing → done → completed` (or `→ failed`).

## Endpoints Pattern

<!-- exodia:section:endpoints -->

Custom endpoints: defined in `packages/@liexp/shared/src/endpoints/api/`.
Route registration: `AddEndpoint(r)(Endpoints.Resource.Custom.EndpointName, handler)`.
Flows: `packages/@liexp/backend/src/flows/` as `ReaderTaskEither<Context, ServerError, Result>`.
Frontend queries: auto-generated via `@ts-endpoint/tanstack-query` → `Queries.Resource.Custom.Name.useQuery(...)`.

## State Management

<!-- exodia:section:state -->

Per-service: TypeORM + PostgreSQL (api, ai-bot, worker), Redis (api/worker pub-sub), in-memory LangGraph state (agent). No shared state layer.

## Build

<!-- exodia:section:build -->

- `tsc -b tsconfig.build.json` for packages (output to `lib/`)
- `tsc` for services (output to `build/`)
- Source always in `src/`, never edit `lib/` or `build/`
- Storybook imports from `@liexp/ui/lib/...` — build `@liexp/ui` before storybook type-check

## L3 Data

<!-- exodia:section:l3 -->

- `decisions.jsonl`: Architecture Decision Records for non-obvious choices.
