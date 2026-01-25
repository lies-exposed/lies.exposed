# lies.exposed Documentation

Welcome to the lies.exposed platform documentation. This is a fact-checking and information analysis system built with TypeScript, React, and modern AI capabilities.

## Quick Navigation

### Getting Started
- [**Prerequisites & Setup**](./getting-started/README.md) - First-time setup, dependencies, Docker

### Services
- [**Services Overview**](./services/README.md) - Architecture and service interactions
- [API](./services/api.md) | [AI-Bot](./services/ai-bot.md) | [Worker](./services/worker.md) | [Agent](./services/agent.md)
- [Web](./services/web.md) | [Admin](./services/admin.md) | [Storybook](./services/storybook.md)

### Packages
- [**Packages Overview**](./packages/README.md) - Shared packages and dependencies
- [@liexp/core](./packages/core.md) | [@liexp/io](./packages/io.md) | [@liexp/shared](./packages/shared.md)
- [@liexp/backend](./packages/backend.md) | [@liexp/ui](./packages/ui.md) | [@liexp/test](./packages/test.md)

### Development
- [**Development Guide**](./development/README.md) - Workflow and best practices
- [Code Quality](./development/code-quality.md) | [Functional Programming](./development/functional-programming.md)
- [Kubernetes Access](./development/kubernetes.md)

### Testing
- [**Testing Guide**](./testing/README.md) - Testing strategy overview
- [Unit Tests](./testing/unit-tests.md) | [E2E Tests](./testing/e2e-tests.md) | [Test Utilities](./testing/test-utils.md)

### AI & Deployment
- [**AI Documentation**](./ai/README.md) - AI processing and structured output
- [**Deployment Guide**](./deployment/README.md) - Docker, Kubernetes, Helm

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │    Web      │    │   Admin     │    │  Storybook  │            │
│   │  (SSR/SPA)  │    │(react-admin)│    │   (docs)    │            │
│   └──────┬──────┘    └──────┬──────┘    └─────────────┘            │
│          └────────┬─────────┘                                       │
└───────────────────┼──────────────────────────────────────────────────┘
                    │ REST API
┌───────────────────┼──────────────────────────────────────────────────┐
│                   ▼            Backend                               │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                        API Service                           │   │
│   │  • REST endpoints    • JWT auth    • TypeORM/PostgreSQL     │   │
│   └───────────┬─────────────────────────────────┬───────────────┘   │
│               │ MCP/REST                        │ Redis Pub/Sub     │
│   ┌───────────▼───────────┐         ┌───────────▼───────────┐       │
│   │     Agent Service     │         │    Worker Service     │       │
│   │  • LangChain/LangGraph│         │  • Cron jobs          │       │
│   │  • Chat streaming     │         │  • Social media       │       │
│   └───────────▲───────────┘         └───────────────────────┘       │
│               │ REST                                                 │
│   ┌───────────┴───────────┐                                         │
│   │    AI-Bot Service     │                                         │
│   │  • Queue processing   │                                         │
│   │  • Event extraction   │                                         │
│   └───────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────────────┐
│                   ▼            Storage                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│   │  PostgreSQL │  │    Redis    │  │  S3/Spaces  │                 │
│   │  (TypeORM)  │  │  (Pub/Sub)  │  │   (Media)   │                 │
│   └─────────────┘  └─────────────┘  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

## Key Technologies

| Layer | Technologies |
|-------|-------------|
| **Backend** | TypeScript, Express, TypeORM, fp-ts, Effect, LangChain, Redis |
| **Frontend** | React 18, Vite, TanStack Query, Material UI, react-admin, BlockNote |
| **Infrastructure** | Docker, Kubernetes/Helm, PostgreSQL, Redis, S3/Spaces |

## Development URLs

| Service | URL |
|---------|-----|
| Web | http://liexp.dev |
| Admin | http://admin.liexp.dev |
| API | http://api.liexp.dev/v1 |
| Agent | http://agent.liexp.dev/v1 |
| Storybook | http://storybook.liexp.dev:6006 |

## Additional Resources

- [AGENTS.md](../AGENTS.md) - Main project documentation and AI guidelines
- [GitHub Repository](https://github.com/lies-exposed/lies.exposed)
- [Issue Tracker](https://github.com/lies-exposed/lies.exposed/issues)
