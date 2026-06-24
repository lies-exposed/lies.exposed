---
# Worker Service Agent Context
---

Background automation: cron jobs, Redis pub/sub subscribers, Wikipedia enrichment, social media, media processing.

## Routing Table

| Task | Load |
|------|------|
| Architecture, job types, Redis channels | [docs/services/worker.md](../../docs/services/worker.md) |
| Cron job orchestration | `services/worker/src/jobs/` |
| Redis subscribers | `services/worker/src/services/subscribers/` |
| Business flows | `services/worker/src/flows/` |
| Telegram bot commands | `services/worker/src/providers/tg/` |
| Context definition | `services/worker/src/context/` |

## Key Conventions

- Entry point: `services/worker/src/run.ts`
- Subscribes to Redis channels published by api (e.g. `media:thumbnail`, `actor:update`)
- All flows: `ReaderTaskEither<WorkerContext, WorkerError, Result>`
- Cron uses node-cron; Redis uses ioredis pub/sub pattern
- Telegram bot: command handlers in `src/providers/tg/`

## Commands

```bash
pnpm --filter worker dev
pnpm --filter worker run typecheck
pnpm --filter worker run lint
pnpm --filter worker run test
```
