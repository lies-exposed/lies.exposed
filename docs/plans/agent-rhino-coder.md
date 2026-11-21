# Agent: target `rhino-coder` + fix gaps

`rhino-coder` = localai-gateway alias (thinking-on qwen3.8-flash-next-iq3, 131k ctx, swap-guest: ~1 min load).

## Steps
- [x] 1. Add `rhino-coder` to `AvailableModels` (io) and agent provider model list (`chat.controller.ts`).
- [x] 2. Separate `LOCALAI_EMBEDDING_MODEL` from chat model.
- [x] 3. Fix memory scope: `injectMemories` must use the request's agent type.
- [x] 4. Reasoning fallback in `processStreamEvent` emitted with `thinking: true`; sum token usage across model calls; report real model in `usedProvider` default.
- [x] 5. Eval config for rhino-coder (model override via env).
- [x] 6. Extract shared post-turn logic (conversation store + memory write) used by both chat paths.

## Out of scope (follow-ups)
Persistent conversation store, auth/ownership on list/get/delete, auto-compaction, abort on disconnect.
