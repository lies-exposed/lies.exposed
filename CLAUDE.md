# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

lies.exposed is a fact-checking platform built as a pnpm monorepo. It uses functional programming heavily with fp-ts and Effect.

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Run tests (vitest)
pnpm vitest

# Run tests with coverage
pnpm vitest:cov

# Run single package tests
pnpm --filter <package> test

# Run API e2e tests
pnpm --filter api test

# Watch mode for a service (run in separate shell during docker compose up)
pnpm api watch
pnpm web watch

# Docker development
docker compose build
docker compose up -d db
docker compose up api web admin-web data
```

### Package shortcuts from root

```bash
pnpm api <script>      # services/api
pnpm web <script>      # services/web
pnpm admin-web <script> # services/admin-web
pnpm ai-bot <script>   # services/ai-bot
pnpm worker <script>   # services/worker
pnpm core <script>     # packages/@liexp/core
pnpm shared <script>   # packages/@liexp/shared
pnpm ui <script>       # packages/@liexp/ui
pnpm backend <script>  # packages/@liexp/backend
```

## Architecture

### Monorepo Structure

**Packages** (`packages/@liexp/*`): Shared code with source in `src/`, build output in `lib/`
- `@liexp/core` - Core utilities and configurations
- `@liexp/shared` - Domain models, API endpoint definitions, validation schemas
- `@liexp/backend` - Backend utilities, database models, middleware
- `@liexp/ui` - React components and design system
- `@liexp/test` - Test utilities and mock factories

**Services** (`services/*`): Deployable apps with source in `src/`, build output in `build/`
- `api` - REST API (TypeORM + PostgreSQL + Redis queues)
- `web` - Public frontend (React + Vite SSR)
- `admin-web` - Admin interface (react-admin)
- `ai-bot` - Background AI processing
- `worker` - Automation tasks, social media, Wikipedia enrichment
- `agent` - MCP agent service
- `storybook` - Component documentation

### Key Technologies

- **Functional programming**: fp-ts and Effect throughout the codebase
- **Database**: PostgreSQL via TypeORM
- **Queues**: Redis-backed job queues
- **Frontend**: React, Vite, react-admin
- **Testing**: Vitest

## Code Patterns

### Functional Programming

The codebase uses fp-ts and Effect extensively. Follow existing patterns:

```typescript
pipe(
  fp.RTE.Do,
  fp.RTE.bind("data", () => loadData()),
  fp.RTE.chainEitherK(validateData),
  fp.RTE.map(processData)
)
```

Do not mix imperative and functional styles.

### Imports

- Use absolute imports from packages: `@liexp/core`, `@liexp/shared`, etc.
- Domain models and API schemas live in `@liexp/shared`

### Build Outputs

**Never edit files in `lib/` or `build/` directories** - these are generated. Always edit source files in `src/`.

## Testing

### API E2E Tests

Tests use `AppTest` from `services/api/test/AppTest.ts`:
- `GetAppTest()` returns `{ ctx, mocks, req }`
- External providers are mocked (axios, puppeteer, s3, ffmpeg)
- Requires reachable Postgres DB

Helper patterns:
```typescript
const Test = await GetAppTest()
const user = await saveUser(Test.ctx, scopes)
const { authorization } = await loginUser(Test)(user)
await Test.req.get('/endpoint').set('Authorization', authorization)
```

Use arbitraries from `@liexp/test` (e.g., `MediaArb`, `ProjectArb`, `KeywordArb`).

## OpenAI Structured Output

When using OpenAI structured output with schemas, all properties must be required:

```typescript
// Wrong - optional properties not supported
const Schema = S.Struct({
  name: S.String,
  date: S.optional(S.String), // Error
});

// Correct - use NullOr for optional values
const Schema = S.Struct({
  name: S.String,
  date: S.NullOr(S.String), // OK
  unknownDate: S.String, // Use "unknown" as sentinel value
});
```

Avoid `Schema.DateFromString` (creates ZodEffects). Use `Schema.String` with manual validation.

## Git Conventions

Commits follow conventional commits (enforced by commitlint).
