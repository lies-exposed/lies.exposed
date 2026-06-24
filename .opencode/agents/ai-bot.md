---
description: Specialized agent for the ai-bot service — AI job processor that polls the queue and runs OpenAI/LLM extraction jobs
mode: subagent
hidden: false
---

Load instructions from `services/ai-bot/AGENTS.md` for routing table, key conventions, and commands.

Working directory: `services/ai-bot/`.

Key conventions:
- Entry point: `services/ai-bot/src/run.ts`
- Polls `Queues.List({ Query: { status: ["pending", "processing"] } })` via API client
- Updates jobs via `Queues.Edit({ Params: { id, type, resource }, Body: updatedJob })`
- Calls Agent service via `ctx.agent.Chat.Create({ Body: { message, conversation_id: null } })`
- All OpenAI structured output schemas: every property required, `Schema.NullOr()` not `Schema.optional()`
- Queue status flow: `pending → processing → done → completed` (or `→ failed`)
- Run `pnpm --filter ai-bot dev` / `pnpm --filter ai-bot run typecheck`

## Context Update

After completing a task, walk the Self-Update Rules in `AGENTS.md` and append durable findings to `context/`.
