---
# Web Service Agent Context
---

Public-facing SSR frontend: React, Vite 7.x custom SSR, TanStack Query, server-side rendering.

## Routing Table

| Task | Load |
|------|------|
| Architecture, SSR setup, routing | [docs/services/web.md](../../docs/services/web.md) |
| Client app entry | `services/web/src/client/index.tsx` |
| Route definitions + SSR queries | `services/web/src/client/routes.tsx` |
| Page components | `services/web/src/client/pages/` |
| Entity templates | `services/web/src/client/templates/` |
| SSR server | `services/web/src/server/server.tsx` |
| SSR routing logic | `services/web/src/server/ssr.tsx` |
| UI components | `packages/@liexp/ui/src/` (import from `lib/`) |

## Key Conventions

- Vite 7.x with custom SSR (not standard SPA mode)
- Queries auto-generated via `@ts-endpoint/tanstack-query` → `useEndpointQueries()` hook
- Import UI from `@liexp/ui/lib/...` — run `pnpm --filter @liexp/ui run build` first if new files added
- Two tsconfigs: one for client, one for server (strict mode both)
- SSR render entry: `services/web/src/server/ssr-render.tsx`

## Commands

```bash
pnpm --filter web dev
pnpm --filter web run typecheck
pnpm --filter web run lint
pnpm --filter web run build
```
