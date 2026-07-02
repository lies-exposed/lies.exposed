# Migration Plan: `useStreamingChat` → `@ai-sdk/react`

## Current Architecture

- **Client**: Custom `useStreamingChat` hook with manual SSE parsing (`useSendMessage.ts`) + `ChatUI` component
- **Server**: `sendChatMessageStream` emits custom `ChatStreamEvent` types (message_start, content_delta, tool_call_start/end, message_end, error)
- **Message format**: `ChatMessage` (id, role, content, timestamp, tool_calls)
- **Features**: SSE streaming, tool calls, provider selection, auto-compact, context pinning, conversation history

## Migration Strategy

### Phase 1: Server Adapter — Make backend compatible with `@ai-sdk/react`

1. Add `ai` package to `services/agent/package.json`
2. Create a new API route (e.g., `/api/proxy/agent/chat/stream`) that:
   - Accepts the same `ChatRequest` payload
   - Converts messages to AI SDK format
   - Calls the existing `sendChatMessageStream` flow
   - Wraps the custom stream events into AI SDK's `DataStream` format
   - Returns `toDataStreamResponse()`
3. The adapter bridges:
   - `ChatStreamEvent.message_start` → AI SDK `metadata` part
   - `ChatStreamEvent.content_delta` → AI SDK `text_delta` part
   - `ChatStreamEvent.tool_call_start/end` → AI SDK `tool_call_delta` parts
   - `ChatStreamEvent.message_end` → AI SDK `text_final` + `usage`
   - `ChatStreamEvent.error` → AI SDK `error` part

### Phase 2: Client Hook — Replace `useStreamingChat` with `useChat`

4. Replace `useStreamingChat` hook with `useChat({ transport: new DefaultChatTransport({ api: '/api/proxy/agent/chat/stream' }) })`
5. Remove `useSendMessage.ts` entirely (streaming handled by `useChat`)
6. Remove manual state management for `streamingContent`, `thinkingContent`, `activeToolCalls` — these become part of `UIMessage.parts`
7. Keep `useChatConversations` for history panel (unchanged)
8. Keep `useChatCompact` for context management (unchanged)

### Phase 3: Message Rendering — Adapt ChatUI to UIMessage

9. Convert `ChatMessage[]` → `UIMessage[]` mapping in `AdminChat.tsx`:
   - `ChatMessage.content` → `UIMessagePart.text`
   - `ChatMessage.tool_calls` → `UIMessagePart.tool-invocation`
10. Update `ChatUI.tsx` to render `UIMessage.parts` instead of flat `ChatMessage` array
11. Handle `tool-invocation` parts with different states (partial-call, call, result)

### Phase 4: Provider & Context — Wire up provider selection

12. `useChat` sends `body` options — pass `aiConfig` via `sendMessage` options instead of hook config
13. Server adapter reads `aiConfig` from request body to select provider
14. Keep `ProviderSelector` component but remove its internal auth logic (handled by transport headers)
15. Pass auth token via transport: `new DefaultChatTransport({ headers: { Authorization: getAuthFromLocalStorage() } })`

### Phase 5: Cleanup

16. Remove `AdminChat.tsx` state for `streamingContent`, `thinkingContent`, `activeToolCalls`, `streamingMessage`
17. Remove `INITIAL_STATE` from `types.ts` (no longer needed)
18. Remove `estimateTokens` helper (AI SDK provides usage)
19. Update tests in `useStreamingChat.test.ts`
20. Keep `ChatUI` component but simplify props — remove `streamingMessage`, `tokenUsage`, `context` props (now in message metadata)

## Files to Change

| File | Action |
|------|--------|
| `services/agent/package.json` | Add `ai` dependency |
| `services/agent/src/flows/chat/chat.flow.ts` | Add adapter function to convert stream to AI SDK format |
| `services/agent/src/routes/chat/chat.controller.ts` | Add new stream route using AI SDK `toDataStreamResponse()` |
| `services/admin/src/hooks/useStreamingChat.ts` | Replace with thin wrapper around `useChat` |
| `services/admin/src/hooks/chat/useSendMessage.ts` | **Delete** |
| `services/admin/src/hooks/chat/types.ts` | Remove `INITIAL_STATE`, `estimateTokens` |
| `services/admin/src/components/chat/AdminChat.tsx` | Simplify — remove streaming state, wire `useChat` |
| `packages/@liexp/ui/src/components/Chat/ChatUI.tsx` | Adapt to render `UIMessage.parts` |
| `packages/@liexp/ui/src/components/Chat/StreamingMessage.tsx` | **Delete** (streaming handled by `useChat` directly) |
| `packages/@liexp/ui/src/components/Chat/ChatInput.tsx` | Minor: use `sendMessage` from hook |
| `services/admin/src/hooks/useStreamingChat.test.ts` | Rewrite for new hook |

## Key Differences to Handle

| Current | `@ai-sdk/react` |
|---------|-----------------|
| `ChatMessage[]` flat list | `UIMessage[]` with `parts` array |
| Manual SSE parsing | Automatic stream decoding |
| `streamingContent` state | `message.parts.find(p => p.type === 'text')?.text` |
| `activeToolCalls` Map | `message.parts.filter(p => p.type === 'tool-invocation')` |
| `isLoading` boolean | `status === 'streaming'` |
| Token usage estimation | Built-in `usage` from AI SDK |
| Provider via request body | Provider via `body` options in `sendMessage` |

## Risk Areas

- **Server adapter**: Must correctly map custom SSE events to AI SDK's DataStream format. The AI SDK expects specific protocol parts (`text_delta`, `tool_call_delta`, etc.)
- **Tool call rendering**: `UIMessagePart.tool-invocation` has a different structure than `ChatMessage.tool_calls`
- **Conversation loading**: Must convert `ChatMessage[]` → `UIMessage[]` when loading history
