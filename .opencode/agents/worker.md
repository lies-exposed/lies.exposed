---
description: Specialized agent for the worker service — background automation with cron jobs, Redis pub/sub, Wikipedia enrichment, and social media posting
mode: subagent
hidden: false
---

Load instructions from `services/worker/AGENTS.md` for routing table, key conventions, and commands.

Working directory: `services/worker/`.

Key conventions:
- Entry point: `services/worker/src/run.ts`
- Cron jobs in `services/worker/src/jobs/`
- Redis subscribers in `services/worker/src/services/subscribers/`
- Business flows in `services/worker/src/flows/`
- Telegram bot commands in `services/worker/src/providers/tg/`
- Subscribes to Redis channels published by api (e.g. `media:thumbnail`, `actor:update`)
- Run `pnpm --filter worker dev` / `pnpm --filter worker run typecheck`

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
