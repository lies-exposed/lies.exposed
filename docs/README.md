# lies.exposed Documentation

Welcome to the lies.exposed platform documentation. This directory contains comprehensive technical documentation for all services, packages, and development workflows.

## Quick Links

### Services

| Service | Description | Documentation |
|---------|-------------|---------------|
| **API** | Core REST API backend | [Backend Services](./services/backend.md#1-api-service-servicesapi) |
| **AI-Bot** | AI processing engine | [Backend Services](./services/backend.md#2-ai-bot-service-servicesai-bot) |
| **Worker** | Background automation | [Backend Services](./services/backend.md#3-worker-service-servicesworker) |
| **Agent** | LLM chat service | [Backend Services](./services/backend.md#4-agent-service-servicesagent) |
| **Web** | Public frontend (SSR) | [Frontend Services](./services/frontend.md#1-web-service-servicesweb) |
| **Admin** | Admin interface | [Frontend Services](./services/frontend.md#2-admin-service-servicesadmin) |
| **Storybook** | Component library | [Frontend Services](./services/frontend.md#4-storybook-service-servicesstorybook) |

### Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| **@liexp/core** | Core utilities, logging, fp-ts | [Packages](./packages/README.md#liexpcore---core-utilities-and-configurations) |
| **@liexp/io** | Domain types, HTTP schemas | [Packages](./packages/README.md#liexpio---http-schemas-and-domain-types) |
| **@liexp/shared** | API endpoints, helpers | [Packages](./packages/README.md#liexpshared---domain-models-api-definitions-business-logic) |
| **@liexp/backend** | Backend utilities | [Packages](./packages/README.md#liexpbackend---backend-utilities) |
| **@liexp/ui** | React components | [Frontend Services](./services/frontend.md#3-ui-package-packagesliexpui) |
| **@liexp/test** | Testing utilities | [Packages](./packages/README.md#liexptest---testing-utilities-and-configurations) |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │    Web      │    │   Admin     │    │  Storybook  │            │
│   │  (SSR/SPA)  │    │(react-admin)│    │   (docs)    │            │
│   └──────┬──────┘    └──────┬──────┘    └─────────────┘            │
│          │                  │                                       │
│          └────────┬─────────┘                                       │
│                   │                                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │ REST API
┌───────────────────┼──────────────────────────────────────────────────┐
│                   ▼            Backend                               │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                        API Service                           │   │
│   │  • REST endpoints    • JWT auth    • TypeORM/PostgreSQL     │   │
│   │  • MCP Server        • Redis       • Queue management       │   │
│   └───────────┬─────────────────────────────────┬───────────────┘   │
│               │ MCP/REST                        │ Redis Pub/Sub     │
│   ┌───────────▼───────────┐         ┌───────────▼───────────┐       │
│   │     Agent Service     │         │    Worker Service     │       │
│   │  • LangChain/LangGraph│         │  • Cron jobs          │       │
│   │  • Chat streaming     │         │  • Social media       │       │
│   │  • Multi-provider LLM │         │  • Wikipedia enrich   │       │
│   └───────────▲───────────┘         │  • Media processing   │       │
│               │ REST                 └───────────────────────┘       │
│   ┌───────────┴───────────┐                                         │
│   │    AI-Bot Service     │                                         │
│   │  • Queue processing   │                                         │
│   │  • Event extraction   │                                         │
│   │  • Structured output  │                                         │
│   └───────────────────────┘                                         │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────────────┐
│                   ▼            Storage                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│   │  PostgreSQL │  │    Redis    │  │  S3/Spaces  │                 │
│   │  (TypeORM)  │  │  (Pub/Sub)  │  │   (Media)   │                 │
│   └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm v8+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+

### Quick Start

```bash
# Clone and install
git clone https://github.com/lies-exposed/lies.exposed.git
cd lies.exposed
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

# Start services
pnpm --filter api dev      # Terminal 1
pnpm --filter worker dev   # Terminal 2
pnpm --filter agent dev    # Terminal 3
pnpm --filter web dev      # Terminal 4
pnpm --filter admin dev    # Terminal 5
```

### Development URLs

| Service | URL |
|---------|-----|
| Web | http://liexp.dev |
| Admin | http://admin.liexp.dev |
| API | http://api.liexp.dev/v1 |
| Agent | http://agent.liexp.dev/v1 |
| Storybook | http://storybook.liexp.dev:6006 |

## Key Technologies

### Backend
- **TypeScript** - Type-safe JavaScript
- **Express** - HTTP server framework
- **TypeORM** - Database ORM for PostgreSQL
- **fp-ts** - Functional programming utilities
- **Effect** - Modern functional effects system
- **LangChain** - LLM orchestration
- **Redis** - Pub/sub and caching

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **Material UI** - Component library
- **react-admin** - Admin interface framework
- **BlockNote** - Rich text editor

### Infrastructure
- **Docker** - Containerization
- **Kubernetes/Helm** - Production deployment
- **PostgreSQL** - Primary database
- **Redis** - Message broker
- **S3/Spaces** - Media storage

## Documentation Structure

```
docs/
├── README.md              # This file
├── services/
│   ├── backend.md         # API, AI-Bot, Worker, Agent services
│   └── frontend.md        # Web, Admin, Storybook, UI package
└── packages/
    └── README.md          # Core, IO, Shared, Backend, Test packages
```

## Contributing

See [AGENTS.md](../AGENTS.md) for detailed development guidelines including:
- Functional programming patterns with fp-ts and Effect
- OpenAI structured output requirements
- Testing best practices
- Code organization conventions

## Additional Resources

- [AGENTS.md](../AGENTS.md) - Main project documentation and AI guidelines
- [GitHub Repository](https://github.com/lies-exposed/lies.exposed)
- [Issue Tracker](https://github.com/lies-exposed/lies.exposed/issues)
