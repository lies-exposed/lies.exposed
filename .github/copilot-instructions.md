<!--
Guidance for AI coding assistants working on the lies.exposed monorepo.
Keep this file short, specific, and actionable. See AGENTS.md for deeper patterns.
-->

# Copilot Instructions for lies.exposed

**Purpose**: Give an AI coding agent the minimal, high-value facts to be immediately productive in a functional programming environment with comprehensive testing.

## Big Picture
This is a pnpm monorepo with multiple deployable services under `services/` and shared packages under `packages/`. Key services: `api` (TypeORM + PostgreSQL + Redis queues), `ai-bot` (background AI flows), `worker`, `web`, and `admin-web`.

## Primary Workflows
- **Local dev**: Docker Compose (`compose.yml`) for databases and dependent services.
  Use `pnpm install` then `docker compose up` to boot infra. See `README.md` and `AGENTS.md`.
- **Fast development**: Run `pnpm <service> watch` (e.g. `pnpm api watch`) in a separate shell
  while running containers so file changes trigger restarts.
- **Builds**: `pnpm build` at repo root builds all packages; services also contain local build scripts.

## Functional Programming with fp-ts and Effect (CRITICAL PATTERNS)

### Core fp-ts Patterns
```typescript
// Standard data transformation pipeline
pipe(
  fp.RTE.Do,
  fp.RTE.bind("data", () => loadData()),
  fp.RTE.chainEitherK(validateData),
  fp.RTE.map(processData)
)

// Error handling with TaskEither
const processWithError = pipe(
  fetchData,
  fp.TE.chain(validateData),
  fp.TE.mapLeft(toControllerError),
  fp.TE.fold(
    (error) => fp.T.of({ error: error.message }),
    (data) => fp.T.of({ success: data })
  )
)

// Option handling for nullable values
pipe(
  fp.O.fromNullable(maybeValue),
  fp.O.fold(
    () => "default value",
    (value) => processValue(value)
  )
)
```

### Effect Patterns (Modern Approach)
```typescript
// State update with Effect
const updateState = pipe(
  Effect.Do,
  Effect.bind("current", () => getCurrentState),
  Effect.bind("new", ({ current }) => validateAndTransform(current)),
  Effect.tap(({ new }) => persistState(new))
)

// Async operations with proper error handling
const fetchAndProcess = pipe(
  fetchData,
  Effect.flatMap(processData),
  Effect.catchAll(handleError),
  Effect.provideService(LoggerLive)
)
```

### Common fp-ts Imports and Usage
```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as A from "fp-ts/lib/Array.js";

// Use fp.RTE for ReaderTaskEither operations
// Use throwTE for converting TaskEither to Promise in tests
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
```

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

*Detailed testing patterns are provided in path-specific instructions for each test type.*

## Code Organization and Imports

### Absolute Imports (REQUIRED)
- Use absolute imports from monorepo packages: `@liexp/core`, `@liexp/shared`, `@liexp/backend`
- Domain models and validation live in `packages/@liexp/shared`
- Import ordering: external → internal → types

### File Structure Rules
- **Source files**: Always edit `src/` directories  
- **Build outputs**: NEVER edit `lib/` or `build/` directories (these are generated)
- **Naming**: `kebab-case.ts` for utils, `PascalCase.ts` for classes/types

### OpenAI Structured Output (AI Flow Schemas)
**CRITICAL**: All properties must be required in OpenAI structured output schemas.
```typescript
// ❌ WRONG - Optional properties cause errors
const BadSchema = Schema.Struct({
  name: Schema.String,
  date: Schema.optional(Schema.String), // This will fail
});

// ✅ CORRECT - All required, use null/sentinel values
const GoodSchema = Schema.Struct({
  name: Schema.String,
  date: Schema.String, // Use "unknown" for missing dates
  publisher: Schema.NullOr(Schema.String), // null for truly optional
});
```
- Never use `Schema.optional()`, `Schema.UndefinedOr()`, or `Schema.DateFromString`
- Use `Schema.NullOr()` for truly optional values
- Use sentinel values: `"unknown"`, `"not specified"`, `"N/A"` for missing data

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
# Install dependencies
pnpm install

# Start infrastructure
docker compose up -d db
docker compose up api web admin-web data

# Development with hot reload
pnpm api watch  # Run outside containers for file watching

# Build and validation
pnpm build      # Build all packages
pnpm typecheck  # Type checking across workspace
pnpm lint       # ESLint validation
pnpm format     # Prettier formatting

# Testing
pnpm vitest                    # Run all tests
pnpm --filter <package> test   # Run tests for specific package
pnpm --filter services/api test # Run API e2e tests
```

### Workspace Commands (pnpm)
```bash
# Use filter for package-specific commands
pnpm --filter api run lint
pnpm api lint  # Shorthand when workspace aliases are available

# Always check your working directory
# From package dir: pnpm run lint
# From root: pnpm --filter <package> run lint
```

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

### Error Handling Patterns
```typescript
// TaskEither error handling
import { toControllerError } from "#io/ControllerError.js";

const safeOperation = pipe(
  riskyOperation(),
  fp.TE.mapLeft(toControllerError),
  fp.TE.fold(
    (error) => fp.T.of({ error: error.message }),
    (data) => fp.T.of({ success: data })
  )
);

// Effect error handling
const safeEffectOperation = pipe(
  riskyEffectOperation,
  Effect.catchAll((error) => 
    Effect.fail(new ControllerError(error.message))
  )
);
```

## Common Pitfalls and Solutions

### Build and File Structure
- ❌ Never edit files in `lib/` or `build/` directories (generated outputs)
- ✅ Always edit source files in `src/` directories
- ❌ Don't mix imperative and functional styles
- ✅ Follow existing fp-ts/Effect patterns consistently

### AI/Agent Development
- ❌ Don't use `services/ai-bot/AGENT.md` for copilot instruction rules
- ✅ Use root `AGENTS.md` as authoritative source for MCP tools and flows
- ❌ Don't create large AI flow rewrites
- ✅ Add small, well-typed helpers in `@liexp/backend` and wire into existing flows

### Testing Anti-Patterns (NEVER DO THESE)
- ❌ Don't test what should NOT happen: `expect(status).not.toBe(500)`
- ❌ Don't use vague negative assertions: `expect(result).not.toBeNull()`  
- ❌ Don't skip `throwTE` when testing TaskEither flows
- ❌ Don't mix imperative and functional testing styles
- ❌ Don't create brittle tests with hardcoded data (use arbitraries)
- ❌ Don't write tests without proper AppTest setup for E2E

### Security and Configuration
- ❌ No hardcoded secrets or credentials in code
- ✅ Use environment variables (see `.env.example`)
- ❌ Don't skip input validation
- ✅ Validate all external inputs using schemas from `@liexp/shared`

## Reference Files (Consult First)
1. **`AGENTS.md` (root)** — Platform and agent overview (primary source for agent/tool rules)
2. **`packages/@liexp/shared/`** — Domain models and API schemas
3. **`services/api/README.md` and `ormconfig.js`** — API-specific configuration
4. **`compose.yml`** — Local infrastructure composition

### Commit Standards
- Follow conventional commits (enforced by commitlint)
- Run `pnpm typecheck` and `pnpm lint` before committing
- Ensure tests pass: `pnpm vitest`

---
*For deeper patterns and examples, consult `AGENTS.md`. For implementation details, explore the source code in `packages/@liexp/*` and `services/*/src`.*
