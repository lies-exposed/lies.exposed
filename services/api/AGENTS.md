---
# API Service Agent Context
---

Core REST API: JWT auth, TypeORM/PostgreSQL, Express, queue management, Redis Pub/Sub.

## Routing Table

| Task | Load |
|------|------|
| Architecture, context types, endpoint list | [docs/services/api.md](../../docs/services/api.md) |
| Route handlers | `services/api/src/routes/<resource>/` |
| Flows (business logic) | `services/api/src/flows/` |
| Migrations | `services/api/src/migrations/` |
| E2E tests | `services/api/src/routes/<resource>/__tests__/` |
| Test bootstrap | `services/api/test/AppTest.ts` → `GetAppTest()` |
| Error handling patterns | [docs/development/error-handling.md](../../docs/development/error-handling.md) |
| fp-ts patterns | [docs/development/functional-programming.md](../../docs/development/functional-programming.md) |

## Key Conventions

- Routes: `AddEndpoint(r)(Endpoints.Resource.Custom.Name, handler)`
- Flows: `ReaderTaskEither<ServerContext, ServerError, Result>`
- Entities in `packages/@liexp/backend/src/entities/`
- Test helpers: `saveUser(Test.ctx, scopes)`, `loginUser(Test)(user)`
- Never call `services/api/src/` from packages — only packages → services direction

## Commands

```bash
pnpm --filter api dev
pnpm --filter api run typecheck
pnpm --filter api run lint
pnpm --filter api run test
pnpm --filter api migration:run
```
