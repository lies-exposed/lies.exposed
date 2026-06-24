---
# Admin Service Agent Context
---

Content management SPA: react-admin 5.x, Vite 7.x, CRUD for all platform resources, AI chat integration.

## Routing Table

| Task | Load |
|------|------|
| Architecture, resource list, AI chat | [docs/services/admin.md](../../docs/services/admin.md) |
| Main admin component | `services/admin/src/AdminPage.tsx` |
| Resource pages | `services/admin/src/pages/<resource>/` |
| AI chat integration | `services/admin/src/components/chat/` |
| Streaming chat hook | `services/admin/src/hooks/useStreamingChat.ts` |
| Theme | `services/admin/src/theme.ts` |
| UI components | `packages/@liexp/ui/src/` (import from `lib/`) |

## Key Conventions

- Vite 7.x SPA mode (not SSR)
- react-admin 5.x: `<Resource>` components in `AdminPage.tsx`
- Data mutations: run through `transformXxx()` functions before API calls
- Relations: created via separate `dataProvider.create("actor-relations", ...)` — not embedded in main create payload
- Edit endpoint schemas don't include relation fields — silently stripped during validation
- Import UI from `@liexp/ui/lib/...` — run `pnpm --filter @liexp/ui run build` first if new files added

## Commands

```bash
pnpm --filter admin dev
pnpm --filter admin run typecheck
pnpm --filter admin run lint
pnpm --filter admin run build
```
