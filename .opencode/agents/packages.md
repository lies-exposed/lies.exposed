---
description: Specialized agent for @liexp/* shared packages — core, io, shared, backend, ui, test. For cross-package changes or package-level work.
mode: subagent
hidden: false
---

Load instructions from `docs/packages/README.md` for package hierarchy and build order.

Working directory: `packages/@liexp/`.

Key conventions:
- Source always in `src/` — never edit `lib/` (build output)
- Build order: `core` → `io` → `test` → `shared` → `backend` → `ui`
- Build with `pnpm --filter @liexp/<name>... build` (ellipsis includes dependencies)
- Import from `lib/` paths: `@liexp/core/lib/fp/index.js` — never from `src/`
- Always `.js` extension on imports
- `@liexp/core`: logger, fp-ts utils (`fp`, `pipe`), ESLint config, Vite config
- `@liexp/io`: domain types, HTTP schemas, Effect/Schema codecs
- `@liexp/shared`: endpoints (`packages/@liexp/shared/src/endpoints/api/`), helpers, providers
- `@liexp/backend`: TypeORM entities, `ServerContext`, Express middleware, backend flows
- `@liexp/ui`: React components, hooks — storybook imports from `lib/`, build before storybook type-check
- `@liexp/test`: fast-check arbitraries, test helpers

## Per-Package Commands

```bash
pnpm --filter @liexp/core run typecheck
pnpm --filter @liexp/shared... build  # builds with dependencies
pnpm --filter @liexp/ui run build     # needed before storybook typecheck
```

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
