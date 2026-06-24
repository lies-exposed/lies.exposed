---
description: Specialized agent for the api service — core REST API with TypeORM/PostgreSQL, JWT auth, queue management, and Redis Pub/Sub
mode: subagent
hidden: false
---

Load instructions from `services/api/AGENTS.md` for routing table, key conventions, and commands.

Working directory: `services/api/`.

Key conventions:
- Routes: `AddEndpoint(r)(Endpoints.Resource.Custom.Name, handler)`
- Flows: `ReaderTaskEither<ServerContext, ServerError, Result>`
- E2E tests bootstrap: `GetAppTest()` from `services/api/test/AppTest.ts`
- Test helpers: `saveUser(Test.ctx, scopes)`, `loginUser(Test)(user)`
- Run `pnpm --filter api migration:run` after schema changes

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
