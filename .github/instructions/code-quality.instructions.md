---
applyTo: "**/*.ts,**/*.js,**/*.tsx,**/*.jsx,**/*.md"

---

# Code Quality Instructions

When working with any code files, follow these quality standards and commit practices:

## Commit Message Format (CRITICAL)

### Conventional Commits Structure
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Required Types
- `feat`: New feature for the user
- `fix`: Bug fix for the user
- `docs`: Documentation changes
- `chore`: Maintenance tasks, dependency updates
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `ci`: Changes to CI configuration files
- `build`: Changes affecting build system
- `revert`: Reverting a previous commit
- `release`: Version releases

### Required Scopes (lowercase)
- `workspace`: Changes affecting the entire workspace
- `deps` / `deps-dev`: Dependency updates
- `core`: @liexp/core package changes
- `shared`: @liexp/shared package changes  
- `test`: @liexp/test package changes
- `backend`: @liexp/backend package changes
- `ui`: @liexp/ui package changes
- `web`: Web service changes
- `admin`: Admin web service changes
- `api`: API service changes
- `worker`: Worker service changes
- `ai-bot`: AI bot service changes
- `agent`: Agent service changes
- `storybook`: Storybook service changes
- `localai`: LocalAI related changes

### Commit Message Examples
```bash
# ✅ GOOD Examples
feat(api): add user authentication endpoint
fix(web): resolve login form validation issue
docs(shared): update API documentation for events
chore(deps): update fp-ts to v2.16.0
refactor(backend): improve error handling patterns
test(api): add e2e tests for event creation
ci(workspace): update GitHub Actions workflow

# ❌ BAD Examples
Add feature                     # Missing type and scope
feat: new stuff                 # Missing scope
FEAT(API): add endpoint         # Uppercase type/scope
feat(invalid-scope): add thing  # Invalid scope
```

## Code Style Standards

### Import Organization
```typescript
// ✅ CORRECT: External → Monorepo → Internal (alphabetical within groups)
import fc from "fast-check";
import * as TE from "fp-ts/lib/TaskEither.js";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";

import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";

import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { mockedContext } from "../../test/context.js";
import { type ServerContext } from "#context/context.type.js";
```

### File Extensions
```typescript
// ✅ ALWAYS include .js extension for relative imports (TypeScript compiled output)
import { helper } from "./utils/helper.js";
import { config } from "../config/database.js";

// ✅ Include .js extension for monorepo packages (matches build output)
import { pipe } from "fp-ts/lib/function.js";
import { EventEntity } from "@liexp/backend/lib/entities/Event.entity.js";

// ✅ Use # aliases for internal API routes
import { ServerContext } from "#context/context.type.js";
import { MakeActorRoutes } from "#routes/actors/actors.routes.js";
```

### Naming Conventions
```typescript
// ✅ Files: kebab-case for utilities, PascalCase for classes/types
helper-utils.ts
DatabaseConfig.ts
EventType.ts

// ✅ Variables and functions: camelCase
const userName = "john";
const processData = () => {};

// ✅ Types and interfaces: PascalCase
interface UserProfile {}
type EventStatus = "active" | "inactive";

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";
```

## Functional Programming Standards

### fp-ts Patterns
```typescript
// ✅ GOOD: Use pipe for data transformation
const result = pipe(
  input,
  validateData,
  fp.TE.chain(processData),
  fp.TE.mapLeft(toControllerError)
);

// ❌ BAD: Imperative style
let result;
try {
  const validated = validateData(input);
  result = processData(validated);
} catch (error) {
  result = toControllerError(error);
}
```

### Error Handling
```typescript
// ✅ GOOD: Use TaskEither for async operations
const safeOperation = pipe(
  fetchData(),
  fp.TE.chain(validateData),
  fp.TE.mapLeft(toControllerError)
);

// ✅ GOOD: Use Option for nullable values
const findUser = (id: string): Option<User> => 
  pipe(
    users.find(u => u.id === id),
    fp.O.fromNullable
  );
```

## Code Quality Checklist

### Before Every Commit
- [ ] **Format**: Run `pnpm format` (Prettier)
- [ ] **Lint**: Run `pnpm lint` and fix all issues  
- [ ] **Types**: Run `pnpm typecheck` and resolve type errors
- [ ] **Tests**: Run `pnpm vitest` and ensure all tests pass
- [ ] **Build**: Run `pnpm build` to verify compilation

### Code Review Standards
```typescript
// ✅ GOOD: Explicit error handling
const processUser = (userId: string) => pipe(
  getUser(userId),
  fp.TE.chain(validateUser),
  fp.TE.mapLeft(toUserError)
);

// ✅ GOOD: Type safety
interface ProcessUserParams {
  userId: string;
  includeProfile: boolean;
}

// ✅ GOOD: Pure functions
const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, item) => sum + item.price, 0);

// ❌ BAD: Side effects in pure functions
const calculateTotalBad = (items: Item[]): number => {
  console.log("Calculating total"); // Side effect
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

### Performance Considerations
```typescript
// ✅ GOOD: Memoization for expensive operations
const memoizedCalculation = pipe(
  expensiveOperation,
  memoize
);

// ✅ GOOD: Lazy evaluation with Effect
const lazyProcess = Effect.lazy(() => 
  pipe(
    loadLargeData,
    Effect.flatMap(processData)
  )
);
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

### README Updates
When adding new features or changing APIs:
- [ ] Update relevant README.md files
- [ ] Include code examples
- [ ] Document breaking changes
- [ ] Update installation/setup instructions if needed

## Security Standards

### Input Validation
```typescript
// ✅ GOOD: Always validate external inputs
const validateUserInput = (input: unknown): Either<ValidationError, UserInput> =>
  pipe(
    input,
    UserInputSchema.decode,
    E.mapLeft(toValidationError)
  );
```

### No Hardcoded Secrets
```typescript
// ✅ GOOD: Use environment variables
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;

// ❌ BAD: Hardcoded credentials
const dbUrl = "postgresql://user:pass@localhost:5432/db";
const apiKey = "sk-1234567890abcdef";
```

## Critical Anti-Patterns

### ❌ NEVER DO
- Use `console.log` in production code (ESLint error - use logger instead)
- Skip error handling in async operations
- Mix imperative and functional programming styles
- Edit files in `lib/` or `build/` directories (generated)
- Use `any` type without justification (ESLint warning)
- Create side effects in pure functions
- Import from `/src/` paths in monorepo packages (ESLint error)
- Use underscore-prefixed variables without ignoring them

### ✅ ALWAYS DO
- Use absolute imports for monorepo packages
- Include proper error handling for all operations
- Add tests for new functionality
- Update documentation for API changes
- Follow conventional commit format
- Run all quality checks before committing
- Use `type` imports for type-only imports: `import { type User }`
- Prefix unused variables with underscore: `const _unusedVar = data`
- Use `return await` for better stack traces in async functions