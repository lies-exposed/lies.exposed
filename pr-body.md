## WS7 — Repoint admin chat and ai-bot to ZeroClaw

Replace `services/admin/src/server/routes/agent-proxy.routes.ts` and the ai-bot
`agent.url` / `agent.http.client.ts` with an adapter to the ZeroClaw webhook.
Feature-flagged behind `ZEROCLOW_ENABLED` so both agents run in parallel.

### Changes

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

1. **Streaming dropped** — ZeroClaw has no streaming equivalent. The adapter makes a synchronous HTTP call and waits for the full response.
2. **Conversation tracking dropped** — ZeroClaw has no conversation model. The admin frontend manages conversation history client-side.
3. **Feature flag** — `ZEROCLOW_ENABLED` controls whether ZeroClaw is used. When disabled, all routes fall through to the legacy agent service.
4. **Flows staying on old agent** — Flows needing events/media/areas/nations/socialposts stay on the old agent service; this adapter only handles actor/group/link queries.

### Acceptance

- [x] Admin chat routes work through ZeroClaw when `ZEROCLOW_ENABLED=true`
- [x] Admin chat routes fall back to legacy agent when `ZEROCLOW_ENABLED=false` (default)
- [x] Ai-bot agent URL is overridden when ZeroClaw is enabled
- [x] TypeScript compiles clean for both `services/admin` and `services/ai-bot`
- [x] No breaking changes to existing API contracts

### Depends on
- WS4, WS6 (ZeroClaw infrastructure)
