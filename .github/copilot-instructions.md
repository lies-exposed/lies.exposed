<!--
Guidance for AI coding assistants working on the lies.exposed monorepo.
Keep this file short, specific, and actionable. See AGENTS.md for deeper patterns.
-->

# Copilot Instructions for lies.exposed

**Purpose**: Give an AI coding agent the minimal, high-value facts to be immediately productive in a functional programming environment with comprehensive testing.

## Big Picture
This is a pnpm monorepo with multiple deployable services under `services/` and shared packages under `packages/`. Key services: `api` (TypeORM + PostgreSQL + Redis queues), `ai-bot` (background AI flows), `worker`, `web`, and `admin`.

## Primary Workflows
- **Local dev**: Docker Compose (`compose.yml`) for databases and dependent services.
  Use `pnpm install` then `docker compose up` to boot infra. See `README.md` and `AGENTS.md`.
- **Fast development**: Run `pnpm <service> watch` (e.g. `pnpm api watch`) in a separate shell
  while running containers so file changes trigger restarts.
- **Builds**: `pnpm build` at repo root builds all packages; services also contain local build scripts.

## Functional Programming with fp-ts and Effect (CRITICAL PATTERNS)

### Core Principles
- Use `pipe` for data transformation pipelines
- `TaskEither` for async operations with error handling
- `Option` for nullable value handling
- `Effect` for modern functional effects (preferred for new code)

### Essential Imports
```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
```

*Detailed patterns: [docs/development/functional-programming.md](../docs/development/functional-programming.md)*

## Testing Patterns (CRITICAL FOR QUALITY)

### Testing Philosophy
**ALWAYS test what SHOULD happen, not what should NOT happen.**

### Key Testing Requirements
- **Unit Tests**: Use `throwTE` to convert TaskEither to Promise, use arbitraries for test data
- **E2E Tests**: Use `GetAppTest()` setup with proper authentication patterns
- **Mocking**: Use `vitest-mock-extended` and `mockTERightOnce` for fp-ts types
- **Assertions**: Test specific expected values: `expect(status).toBe(200)`, not `expect(status).not.toBe(500)`

### Critical Anti-Patterns (NEVER DO)
```typescript
// ❌ BAD: Negative assertions hide expectations
expect(response.status).not.toBe(500);
expect(result).not.toBeNull();

// ✅ GOOD: Test specific expected outcomes
expect(response.status).toBe(200);
expect(result).toMatchObject({ id: expect.any(String) });
```

### Test Organization
- **E2E tests**: `services/api/test/*.e2e.ts` with AppTest setup
- **Unit tests**: `**/*.spec.ts` co-located with source files
- **Test utilities**: `**/test/**/*.ts` for mocks and helpers

*Detailed testing patterns:*
- *[docs/testing/unit-tests.md](../docs/testing/unit-tests.md)*
- *[docs/testing/e2e-tests.md](../docs/testing/e2e-tests.md)*
- *[docs/testing/test-utils.md](../docs/testing/test-utils.md)*

## Code Organization and Imports

### Project Structure
- **Source files**: Always edit `src/` directories
- **Build outputs**: NEVER edit `lib/` or `build/` directories (generated)
- **Monorepo packages**: `@liexp/core`, `@liexp/shared`, `@liexp/backend`, `@liexp/ui`, `@liexp/test`
- **Domain models**: Located in `packages/@liexp/shared`

*Detailed patterns: [docs/development/code-quality.md](../docs/development/code-quality.md)*

### AI Schema Requirements (OpenAI Structured Output)
**CRITICAL**: All properties must be required in OpenAI structured output schemas.
- Never use `Schema.optional()`, `Schema.UndefinedOr()`, or `Schema.DateFromString`
- Use `Schema.NullOr()` for truly optional values
- Use sentinel values: `"unknown"`, `"not specified"`, `"N/A"` for missing data

*Detailed patterns: [docs/ai/openai-schemas.md](../docs/ai/openai-schemas.md)*

## Database and Entities

### TypeORM Patterns
- Database: PostgreSQL with TypeORM
- Migrations: `services/api/ormconfig.js`
- Entities: Use existing entity patterns in `@liexp/backend/src/entities/`

### Integration Points
- **Queueing**: Redis-backed job queue (ai-bot/worker)
- **Docker**: `compose.yml` and `compose.reverse-proxy.yml` for local development

## Development Commands

### Essential Commands
```bash
pnpm install           # Install dependencies
docker compose up -d db && docker compose up api web admin
pnpm api watch         # Development with hot reload
pnpm build            # Build and validation
pnpm typecheck        # Type checking
pnpm lint             # ESLint validation
pnpm vitest           # Run all tests
```

### Workspace Commands (pnpm)
- Shorthand when aliases available: `pnpm api lint`
- Use filter for package-specific commands: `pnpm --filter api run lint`
- Always check working directory context

## Development Workflow & Quality Standards

### Priority Order (STRICT)
1. **Functionality**: Core logic works correctly
2. **Type Safety**: All TypeScript types are correct
3. **Tests**: Comprehensive test coverage (unit + e2e)
4. **Code Style**: Formatting and linting (addressed last)

### Testing Requirements
- **Coverage**: Minimum 80% coverage for new code
- **E2E Tests**: Use `GetAppTest()` for API testing
- **Unit Tests**: Test pure functions and business logic
- **Test Data**: Use arbitraries from `@liexp/test` for consistent data generation

*Detailed patterns: [docs/testing/README.md](../docs/testing/README.md)*

## Common Pitfalls and Solutions

### Build and File Structure
- ❌ Never edit files in `lib/` or `build/` directories (generated outputs)
- ✅ Always edit source files in `src/` directories

### Development Workflow
- ❌ Don't mix imperative and functional styles
- ✅ Follow existing fp-ts/Effect patterns consistently
- ❌ Don't skip input validation
- ✅ Use environment variables (see `.env.example`)

*Detailed patterns: [docs/development/README.md](../docs/development/README.md)*

## Reference Documentation

### Primary References
1. **`AGENTS.md` (root)** — Platform and agent overview (primary source for agent/tool rules)
2. **[docs/](../docs/README.md)** — Comprehensive documentation
3. **`packages/@liexp/shared/`** — Domain models and API schemas
4. **`services/api/README.md` and `ormconfig.js`** — API-specific configuration

### Documentation Structure
- [Getting Started](../docs/getting-started/README.md) — Setup and prerequisites
- [Services](../docs/services/README.md) — Service architecture and APIs
- [Packages](../docs/packages/README.md) — Shared package documentation
- [Development](../docs/development/README.md) — Code quality and workflows
- [Testing](../docs/testing/README.md) — Testing patterns and utilities
- [AI](../docs/ai/README.md) — AI processing and schemas
- [Deployment](../docs/deployment/README.md) — Docker, Kubernetes, Helm

### Commit Standards
- Follow conventional commits (enforced by commitlint)
- Run `pnpm typecheck` and `pnpm lint` before committing
- Ensure tests pass: `pnpm vitest`

*Detailed commit format: [docs/development/code-quality.md](../docs/development/code-quality.md)*

---
*For deeper patterns and examples, consult `AGENTS.md`. For implementation details, explore the source code in `packages/@liexp/*` and `services/*/src`.*
