---
applyTo: "**/*.ts,**/*.js,**/*.tsx,**/*.jsx,**/*.md"
---

# Code Quality Instructions

> **Full documentation**: [docs/development/code-quality.md](../../docs/development/code-quality.md)

## Quick Reference (LLM Action Block)

### Commit Format
```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `revert`, `release`

**Scopes**: `workspace`, `deps`, `core`, `shared`, `test`, `backend`, `ui`, `web`, `admin`, `api`, `worker`, `ai-bot`, `agent`, `storybook`

### Import Order (STRICT)
```typescript
// 1. External packages
import fc from "fast-check";
import * as TE from "fp-ts/lib/TaskEither.js";

// 2. Monorepo packages
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

// 3. Internal/relative imports
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type ServerContext } from "#context/context.type.js";
```

### Critical Rules

**ALWAYS**:
- Include `.js` extension in imports
- Use `type` keyword for type-only imports: `import { type User }`
- Use `@liexp/*/lib/` paths (never `/src/`)
- Edit files in `src/` directories only

**NEVER**:
- Use `console.log` (use logger)
- Edit files in `lib/` or `build/`
- Use `any` without justification
- Mix imperative and functional styles

### fp-ts Pattern
```typescript
const result = pipe(
  input,
  fp.TE.chain(validateData),
  fp.TE.map(processData),
  fp.TE.mapLeft(toControllerError)
);
```

### Before Commit Checklist
```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm vitest
```
