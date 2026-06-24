---
description: Specialized agent for the web service — public-facing SSR frontend with React, Vite, and TanStack Query
mode: subagent
hidden: false
---

Load instructions from `services/web/AGENTS.md` for routing table, key conventions, and commands.

Working directory: `services/web/`.

Key conventions:
- Bundler: Vite 7.x with custom SSR configuration
- Client entry: `services/web/src/client/index.tsx`
- Route definitions with SSR queries: `services/web/src/client/routes.tsx`
- Server entry: `services/web/src/server/`
- Queries auto-generated via `@ts-endpoint/tanstack-query` — access via `useEndpointQueries()` hook
- UI components from `@liexp/ui/lib/...` — build `@liexp/ui` first if new files were added
- Run `pnpm --filter web dev` / `pnpm --filter web run typecheck`

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
