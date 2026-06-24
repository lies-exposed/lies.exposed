---
description: Specialized agent for the admin service — content management interface with react-admin 5.x and Vite SPA
mode: subagent
hidden: false
---

Load instructions from `services/admin/AGENTS.md` for routing table, key conventions, and commands.

Working directory: `services/admin/`.

Key conventions:
- Bundler: Vite 7.x (SPA mode, not SSR)
- Framework: react-admin 5.x
- Entry point: `services/admin/src/index.tsx`
- Main admin component: `services/admin/src/AdminPage.tsx`
- Resource definitions use react-admin `<Resource>` components
- Data mutations go through `transformXxx` functions before API calls
- Relations created via separate `dataProvider.create("actor-relations", ...)` calls — not embedded in the main create payload
- UI components from `@liexp/ui/lib/...` — build `@liexp/ui` first if new files were added
- Run `pnpm --filter admin dev` / `pnpm --filter admin run typecheck`

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
