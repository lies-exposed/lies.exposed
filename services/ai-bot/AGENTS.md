---
# AI-Bot Service Agent Context
---

AI job processor: polls API queue, runs OpenAI/LLM extraction jobs, communicates with Agent service.

## Routing Table

| Task | Load |
|------|------|
| Architecture, job types, processing loop | [docs/services/ai-bot.md](../../docs/services/ai-bot.md) |
| Main queue flow | `services/ai-bot/src/flows/processOpenAIQueue.flow.ts` |
| Job type router | `services/ai-bot/src/flows/ai/jobProcessor.ts` |
| Event extraction flows | `services/ai-bot/src/flows/ai/event/` |
| Context definition | `services/ai-bot/src/context.ts` |
| OpenAI schema rules | [docs/ai/openai-schemas.md](../../docs/ai/openai-schemas.md) |

## Key Conventions

- Entry point: `services/ai-bot/src/run.ts`
- Context: `ClientContext` — includes `APIClientContext`, `AgentClientContext`, `PDFProviderContext`, `PuppeteerProviderContext`
- Polls `Queues.List({ Query: { status: ["pending", "processing"] } })` via API client
- Updates jobs via `Queues.Edit({ Params: { id, type, resource }, Body: updatedJob })`
- Calls Agent: `ctx.agent.Chat.Create({ Body: { message, conversation_id: null } })`
- All OpenAI structured output schemas: every property required, `Schema.NullOr()` not `Schema.optional()`
- Queue status flow: `pending → processing → done → completed` (or `→ failed`)

## Commands

```bash
pnpm --filter ai-bot dev
pnpm --filter ai-bot run typecheck
pnpm --filter ai-bot run lint
pnpm --filter ai-bot run test
```
