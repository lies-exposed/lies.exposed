# @liexp/core

**Version:** 0.1.4
**Location:** `packages/@liexp/core`

## Purpose

The foundation package providing core utilities, configurations, and shared functionality used across all packages and services. It establishes consistent patterns for logging, functional programming utilities, environment handling, ESLint configurations, and Vite build tooling.

## Key Modules

### 1. Logger (`src/logger/`)

A structured logging system built on the `debug` package with consistent log level support.

**Usage:**
```typescript
import { GetLogger } from "@liexp/core/lib/logger/index.js";

const logger = GetLogger("api");
logger.info.log("Server started on port %d", 3000);
logger.error.log("Failed to connect: %O", error);

// Extend for sub-modules
const dbLogger = logger.extend("database");
dbLogger.debug.log("Query executed: %s", query);
```

**Log Levels:**
- `debug` - Detailed debugging information
- `info` - General operational information
- `warn` - Warning conditions
- `error` - Error conditions
- `test` - Test-specific logging

### 2. Functional Programming Utilities (`src/fp/`)

A curated re-export of fp-ts modules with additional utilities.

**Main Export:**
```typescript
import { fp, pipe, flow } from "@liexp/core/lib/fp/index.js";
```

**Available fp-ts Modules:**

| Alias | Module | Purpose |
|-------|--------|---------|
| `fp.A` | `ReadonlyArray` | Immutable array operations |
| `fp.E` | `Either` | Error handling with left/right values |
| `fp.O` | `Option` | Optional value handling |
| `fp.TE` | `TaskEither` | Async operations with error handling |
| `fp.T` | `Task` | Async operations |
| `fp.RTE` | `ReaderTaskEither` | Dependency injection with async error handling |
| `fp.Map` | `Map` | Immutable Map operations |
| `fp.NEA` | `NonEmptyArray` | Non-empty array operations |
| `fp.R` | `Reader` | Dependency injection |
| `fp.Rec` | `Record` | Record/object operations |
| `fp.S` | `string` | String utilities and Eq |
| `fp.N` | `number` | Number utilities and Ord |
| `fp.IO` | `IO` | Synchronous side effects |
| `fp.IOE` | `IOEither` | Synchronous side effects with errors |
| `fp.Ord` | `Ord` | Ordering and comparison |
| `fp.Eq` | `Eq` | Equality comparison |
| `fp.Json` | `Json` | JSON parsing utilities |
| `fp.Date` | `Date` | Date comparison and ordering |
| `sequenceS` | Apply | Parallel sequencing for structs |
| `sequenceT` | Apply | Parallel sequencing for tuples |

**Custom Utilities (`fp.Utils`):**
- `fp.Utils.A.groupBy` - Group array elements by equality
- `fp.Utils.O.fromNonEmptyArray` - Convert non-empty array to Option
- `fp.Utils.NEA.isNonEmpty` - Type guard for non-empty arrays
- `fp.Utils.NEA.nonEmptyArrayOr` - Return array or fallback value

**Usage Example:**
```typescript
import { fp, pipe } from "@liexp/core/lib/fp/index.js";

const processData = pipe(
  fp.RTE.Do,
  fp.RTE.bind("users", () => fetchUsers()),
  fp.RTE.bind("events", ({ users }) => fetchEventsForUsers(users)),
  fp.RTE.map(({ users, events }) => mergeData(users, events)),
  fp.RTE.mapLeft(toAPIError)
);
```

### 3. Environment Configuration (`src/env/`)

Effect-based environment schema definitions and utilities.

```typescript
import { NODE_ENV } from "@liexp/core/lib/env/node-env.js";

// Type: "development" | "test" | "production"
const env = Schema.decodeUnknownSync(NODE_ENV)(process.env.NODE_ENV);
```

### 4. ESLint Configurations (`src/eslint/`)

Pre-configured ESLint setups for TypeScript projects.

**Base Configuration (`base.config.ts`):**
- ESLint recommended rules
- TypeScript ESLint with type-checked rules
- Prettier integration
- fp-ts plugin with best practices
- Import ordering and organization

**React Configuration (`react.config.ts`):**
- Extends base configuration
- React-specific linting rules
- JSX/TSX support

**Key Rules Enforced:**
- `no-console: "error"` - Prevents console usage (use logger instead)
- Import ordering with alphabetization
- Consistent type-only imports
- Unused variable detection with `_` prefix exceptions
- No imports from `/src/` paths (must use `/lib/`)

**Usage:**
```javascript
// eslint.config.js
import baseConfig from "@liexp/core/lib/eslint/base.config.js";

export default [
  ...baseConfig,
  // service-specific overrides
];
```

### 5. Vite Configuration (`src/frontend/vite/`)

Shared Vite configuration factory for frontend services with monorepo HMR support.

```typescript
import { defineViteConfig } from "@liexp/core/lib/frontend/vite/config.js";

export default defineViteConfig({
  cwd: __dirname,
  envFileDir: __dirname,
  env: EnvSchema,
  target: "spa",
  base: "/",
  output: "build",
});
```

**Features:**
- Automatic monorepo root detection
- HMR for package source changes (lib/ -> src/ aliasing)
- Environment validation with Effect schemas
- Pre-configured plugins (React, SVG, CSS injection, tsconfig paths)
- Deduplication of common dependencies (React, MUI)

## Development Commands

```bash
# Build package
pnpm --filter @liexp/core build

# Type checking
pnpm --filter @liexp/core typecheck

# Watch mode
pnpm --filter @liexp/core watch

# Lint
pnpm --filter @liexp/core lint
```

## Related Documentation

- [Functional Programming](../development/functional-programming.md) - FP patterns and best practices
- [Code Quality](../development/code-quality.md) - Code style standards
