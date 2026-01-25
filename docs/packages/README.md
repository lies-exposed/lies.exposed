# Packages Overview

The lies.exposed platform uses a monorepo architecture with shared packages that provide core utilities, domain models, and testing infrastructure.

## Package Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                        Services                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   API   │  │ AI-Bot  │  │ Worker  │  │   Web   │ ...    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼───────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      @liexp/shared                           │
│  (Endpoints, Helpers, Providers, Business Logic)            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        @liexp/io                             │
│  (Domain Types, HTTP Schemas, Error Types)                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       @liexp/core                            │
│  (Logger, FP Utils, ESLint, Vite Config)                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       @liexp/test                            │
│  (Arbitraries, Test Utils) - devDependency                  │
└─────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Version | Description | Documentation |
|---------|---------|-------------|---------------|
| **@liexp/core** | 0.1.4 | Core utilities, logging, fp-ts, ESLint configs | [core.md](./core.md) |
| **@liexp/io** | 0.2.2 | Domain types, HTTP schemas, Effect schemas | [io.md](./io.md) |
| **@liexp/shared** | 0.2.2 | API endpoints, helpers, providers | [shared.md](./shared.md) |
| **@liexp/backend** | 0.1.10 | Backend utilities, entities, contexts | [backend.md](./backend.md) |
| **@liexp/ui** | - | React components, hooks, design system | [ui.md](./ui.md) |
| **@liexp/test** | 0.1.10 | Testing utilities, fast-check arbitraries | [test.md](./test.md) |

## Build Order

When building the monorepo, packages must be built in dependency order:

1. `@liexp/core` (no internal dependencies)
2. `@liexp/io` (depends on @liexp/core)
3. `@liexp/test` (depends on @liexp/core, @liexp/io)
4. `@liexp/shared` (depends on @liexp/core, @liexp/io)
5. `@liexp/backend` (depends on all above)
6. `@liexp/ui` (depends on @liexp/shared)
7. Services (depend on packages)

**Build all packages:**
```bash
# From repository root
pnpm install
pnpm -r build
```

**Build specific package and dependencies:**
```bash
pnpm --filter @liexp/shared... build
```

## Importing from Packages

Always import from the `lib/` directory (build output):

```typescript
// Correct
import { fp } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { Actor } from "@liexp/io/lib/http/index.js";

// Incorrect (will be caught by ESLint)
import { fp } from "@liexp/core/src/fp/index.js"; // Error
```

## Build Output Structure

**IMPORTANT**: Always edit source files, never build outputs:
- **Packages** (`@liexp/*`): Source code in `src/`, build output in `lib/`
- **Services**: Source code in `src/`, build output in `build/`

When making code changes:
- Edit files in `src/` directories
- Never edit files in `lib/` or `build/` directories (these are generated)
