# Code Quality Standards

<!-- LLM Quick Reference - Action Block -->
<details open>
<summary><strong>Quick Reference (for LLMs)</strong></summary>

**Commit**: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`
- Scopes: `workspace`, `api`, `web`, `admin`, `worker`, `core`, `shared`, `ui`, `backend`

**Imports**: External → Monorepo (`@liexp/*`) → Internal. Always use `.js` extension.

**Critical**:
- Use `type` for type-only imports
- Never use `console.log` (use logger)
- Never edit `lib/` or `build/` directories
- Run `pnpm format && pnpm lint && pnpm typecheck` before commit

</details>

---

This document covers commit message format, code style standards, and quality practices.

## Commit Message Format

### Conventional Commits Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Required Types

| Type | Description |
|------|-------------|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `docs` | Documentation changes |
| `chore` | Maintenance tasks, dependency updates |
| `refactor` | Code refactoring without changing functionality |
| `test` | Adding or updating tests |
| `ci` | Changes to CI configuration files |
| `build` | Changes affecting build system |
| `revert` | Reverting a previous commit |
| `release` | Version releases |

### Required Scopes (lowercase)

| Scope | Description |
|-------|-------------|
| `workspace` | Changes affecting the entire workspace |
| `deps` / `deps-dev` | Dependency updates |
| `core` | @liexp/core package changes |
| `shared` | @liexp/shared package changes |
| `test` | @liexp/test package changes |
| `backend` | @liexp/backend package changes |
| `ui` | @liexp/ui package changes |
| `web` | Web service changes |
| `admin` | Admin web service changes |
| `api` | API service changes |
| `worker` | Worker service changes |
| `ai-bot` | AI bot service changes |
| `agent` | Agent service changes |
| `storybook` | Storybook service changes |
| `localai` | LocalAI related changes |

### Commit Message Examples

```bash
# Good Examples
feat(api): add user authentication endpoint
fix(web): resolve login form validation issue
docs(shared): update API documentation for events
chore(deps): update fp-ts to v2.16.0
refactor(backend): improve error handling patterns
test(api): add e2e tests for event creation
ci(workspace): update GitHub Actions workflow

# Bad Examples
Add feature                     # Missing type and scope
feat: new stuff                 # Missing scope
FEAT(API): add endpoint         # Uppercase type/scope
feat(invalid-scope): add thing  # Invalid scope
```

## Code Style Standards

### Import Organization

```typescript
// External → Monorepo → Internal (alphabetical within groups)
import fc from "fast-check";
import * as TE from "fp-ts/lib/TaskEither.js";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";

import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";

import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { mockedContext } from "../../test/context.js";
import { type ServerContext } from "#context/context.type.js";
```

### File Extensions

```typescript
// Always include .js extension for relative imports
import { helper } from "./utils/helper.js";
import { config } from "../config/database.js";

// Include .js extension for monorepo packages
import { pipe } from "fp-ts/lib/function.js";
import { EventEntity } from "@liexp/backend/lib/entities/Event.entity.js";

// Use # aliases for internal API routes
import { ServerContext } from "#context/context.type.js";
import { MakeActorRoutes } from "#routes/actors/actors.routes.js";
```

### Naming Conventions

```typescript
// Files: kebab-case for utilities, PascalCase for classes/types
helper-utils.ts
DatabaseConfig.ts
EventType.ts

// Variables and functions: camelCase
const userName = "john";
const processData = () => {};

// Types and interfaces: PascalCase
interface UserProfile {}
type EventStatus = "active" | "inactive";

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";
```

## Error Handling Standards

### Use TaskEither for Async Operations

```typescript
// Good: Use TaskEither
const safeOperation = pipe(
  fetchData(),
  fp.TE.chain(validateData),
  fp.TE.mapLeft(toControllerError)
);

// Good: Use Option for nullable values
const findUser = (id: string): Option<User> =>
  pipe(
    users.find(u => u.id === id),
    fp.O.fromNullable
  );
```

## Security Standards

### Input Validation

```typescript
// Always validate external inputs
const validateUserInput = (input: unknown): Either<ValidationError, UserInput> =>
  pipe(
    input,
    UserInputSchema.decode,
    E.mapLeft(toValidationError)
  );
```

### No Hardcoded Secrets

```typescript
// Good: Use environment variables
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;

// Bad: Hardcoded credentials
const dbUrl = "postgresql://user:pass@localhost:5432/db";
const apiKey = "sk-1234567890abcdef";
```

## Documentation Standards

### JSDoc for Public APIs

```typescript
/**
 * Creates a new event with the provided data
 * @param eventData - The event data to create
 * @param context - Server context with dependencies
 * @returns TaskEither containing the created event or error
 *
 * @example
 * ```typescript
 * const result = await pipe(
 *   createEvent(eventData, ctx),
 *   throwTE
 * );
 * ```
 */
export const createEvent = (
  eventData: EventInput,
  context: ServerContext
): TE.TaskEither<ControllerError, EventEntity> => {
  // Implementation
};
```

## Performance Considerations

```typescript
// Memoization for expensive operations
const memoizedCalculation = pipe(
  expensiveOperation,
  memoize
);

// Lazy evaluation with Effect
const lazyProcess = Effect.lazy(() =>
  pipe(
    loadLargeData,
    Effect.flatMap(processData)
  )
);
```
