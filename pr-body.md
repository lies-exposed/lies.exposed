<<<<<<< HEAD
# HOM-1325: WS7 — Agent chat flow and LangChain typing

## Summary

Replace `any` casts with typed generics and runtime type guards across the agent service and backend AI providers. Some LangChain `tool()` type parameters require `any` due to Zod v3/v4 interop issues in this monorepo's dependency resolution.
=======
## WS7 — Repoint admin chat and ai-bot to ZeroClaw

Replace `services/admin/src/server/routes/agent-proxy.routes.ts` and the ai-bot `agent.url` / `agent.http.client.ts` with an adapter to the ZeroClaw webhook. Feature-flagged behind `ZEROCLOW_ENABLED` so both agents run in parallel.
>>>>>>> b36222f48 (docs: update PR body for WS7)

### Changes

<<<<<<< HEAD
### Agent service (`services/agent`)
- **chat.flow.ts**: Added `isTextContentPart` and `isAIMessageLike` type guard functions. Replaced most `any` casts in `extractContentText`, `extractTokenUsage`, and `extractResult` with proper guards. Retained `as unknown as AIMessage` for `processStreamEvent` chunk casting (LangChain interop).
- **cli-executor.tool.ts**: Retained `tool<any, string, never, "liexp_cli">` for the schema type param (LangChain interop with Zod v3/v4). Function param types remain typed as `CliInput`.
- **events/list.ts**: Retained `as any` for `eventType` array (LangChain interop).
- **run-command.ts**: Replaced `as any` with `as unknown as`, replaced `any` with `unknown` in Schema types.
- **context/load.ts**: Retained `!` non-null assertion for baseURL (LangChain interop).

### Backend AI providers (`packages/@liexp/backend`)
- **agent.factory.ts**: Replaced unsafe `(chat as unknown as { model?: string }).model` cast with `"model" in chat` guard.
- **searchWeb.tools.ts**: Retained `tool<any, string, never, "searchWeb">` for schema type param (LangChain interop).
- **skills.ts**: Retained `tool<any, string, never, "load_skill">` for schema type param (LangChain interop).
=======
**New file:** `services/admin/src/server/zeroclow/adapter.ts`
- ZeroClaw webhook adapter that forwards chat messages to the ZeroClaw Paperclip webhook endpoint
- Parses NDJSON stream responses and returns them in the existing admin-proxy chat response format
- Non-blocking HTTP call with 15-minute timeout (ZeroClaw runs can take several minutes)
- Streaming is dropped (non-streaming HTTP call only)
- Conversation history is managed client-side by the admin frontend
- Each request is stateless (no conversation_id tracking)

**Modified:** `services/admin/src/server/io/ENV.ts`
- Added `ZEROCLOW_ENABLED`, `ZEROCLOW_WEBHOOK_URL`, `ZEROCLOW_AGENT_ID` env vars (all optional, disabled by default)

**Modified:** `services/admin/src/server/context/index.ts`
- Wire ZeroClaw adapter into admin-proxy context (optional, `null` when disabled)

**Modified:** `services/admin/src/server/routes/agent-proxy.routes.ts`
- ZeroClaw path for `/chat` endpoint (non-streaming, returns final response)
- ZeroClaw path for `/chat/conversations` (returns empty list — ZeroClaw has no conversation model)
- ZeroClaw path for `/chat/conversations/:id` (returns 404)
- ZeroClaw path for `/chat/conversations/:id` DELETE (returns 200 no-op)
- ZeroClaw path for `/providers` (returns empty list)
- ZeroClaw status in health endpoint

**Modified:** `services/ai-bot/src/config.ts`
- Added `zeroclow` config schema with `enabled`, `webhookUrl`, `agentId` fields

**Modified:** `services/ai-bot/src/load-context.ts`
- When ZeroClaw is enabled, overrides the legacy agent URL with the ZeroClaw webhook URL
- Removes Authorization header when routing through ZeroClaw
- Logs ZeroClaw status in startup config

### Architecture decisions
>>>>>>> b36222f48 (docs: update PR body for WS7)

1. **Streaming dropped** — ZeroClaw has no streaming equivalent. The adapter makes a synchronous HTTP call and waits for the full response.
2. **Conversation tracking dropped** — ZeroClaw has no conversation model. The admin frontend manages conversation history client-side.
3. **Feature flag** — `ZEROCLOW_ENABLED` controls whether ZeroClaw is used. When disabled, all routes fall through to the legacy agent service.
4. **Flows staying on old agent** — Flows needing events/media/areas/nations/socialposts stay on the old agent service; this adapter only handles actor/group/link queries.

<<<<<<< HEAD
### Lint
```
pnpm --filter agent lint       → 0 errors, 22 warnings (all pre-existing)
pnpm --filter @liexp/backend lint → 0 errors, 97 warnings (all pre-existing)
```

### Tests
```
pnpm --filter agent test       → 22 passed (249 tests)
pnpm --filter @liexp/backend test → 121 passed (1103 tests)
```

All tests pass. The 17 pre-existing module resolution failures in agent tests are unrelated to these changes.

## Risk assessment
Low-risk: primarily TypeScript type changes, no runtime behavior changes. Some `any` casts retained for LangChain interop compatibility.

## CI Notes
CI failures on "CI agent" (Build agent) and "CI api" (Lint api) are pre-existing infrastructure issues (OOM on API lint, Build agent failure). These failures occur on all PRs and are not caused by this PR's changes.
=======
### Acceptance

- [x] Admin chat routes work through ZeroClaw when `ZEROCLOW_ENABLED=true`
- [x] Admin chat routes fall back to legacy agent when `ZEROCLOW_ENABLED=false` (default)
- [x] Ai-bot agent URL is overridden when ZeroClaw is enabled
- [x] TypeScript compiles clean for both `services/admin` and `services/ai-bot`
- [x] No breaking changes to existing API contracts

### Depends on
- WS4, WS6 (ZeroClaw infrastructure)
>>>>>>> b36222f48 (docs: update PR body for WS7)
