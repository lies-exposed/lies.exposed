# Migration Plan: `useStreamingChat` → `@ai-sdk/react`

## Current Architecture

- **Client**: Custom `useStreamingChat` hook with manual SSE parsing (`useSendMessage.ts`) + `ChatUI` component
- **Server**: `sendChatMessageStream` emits custom `ChatStreamEvent` types (message_start, content_delta, tool_call_start/end, message_end, error)
- **Message format**: `ChatMessage` (id, role, content, timestamp, tool_calls)
- **Features**: SSE streaming, tool calls, provider selection, auto-compact, context pinning, conversation history

## Implementation Plan

### Phase 1: Server Adapter — Make backend compatible with `@ai-sdk/react`

**Step 1.1**: Add `ai` to `services/agent/package.json` dependencies.

**Step 1.2**: Create `services/agent/src/flows/chat/ai-sdk.adapter.ts` — the core adapter:

```typescript
// Convert sendChatMessageStream's ChatStreamEvent generator to AI SDK DataStream
import { streamBits } from "ai";
import type { ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import type { AgentContext } from "../../context/context.type.js";

export const createAiDataStream = async (
  streamGenerator: AsyncGenerator<ChatStreamEvent>,
  metadata: Record<string, unknown>,
): Promise<ReadableStream<Uint8Array>> => {
  const { writableStreamFromAsyncGenerator } = await import("ai");
  // Wrap the generator to emit AI SDK protocol parts
  const wrapped = (async function* () {
    for await (const event of streamGenerator) {
      switch (event.type) {
        case "message_start":
          yield { type: "metadata", metadata };
          break;
        case "content_delta":
          yield { type: "text_delta", value: event.content ?? "" };
          break;
        case "tool_call_start":
          yield {
            type: "tool-call-delta",
            toolCall: {
              toolName: event.tool_call!.name,
              toolCallId: event.tool_call!.id,
              args: {},
            },
          };
          break;
        case "tool_call_end":
          yield {
            type: "tool-call-delta",
            toolCall: {
              toolName: event.tool_call!.name,
              toolCallId: event.tool_call!.id,
              args: event.tool_call!.arguments,
              toolCallResult: event.tool_call!.result,
            },
          };
          break;
        case "message_end":
          yield { type: "text_final", value: event.content ?? "" };
          if (event.usage) {
            yield {
              type: "usage",
              tokens: {
                prompt: event.usage.prompt_tokens ?? 0,
                completion: event.usage.completion_tokens ?? 0,
              },
            };
          }
          break;
        case "error":
          yield { type: "error", value: event.error ?? "Unknown error" };
          break;
      }
    }
  })();

  return writableStreamFromAsyncGenerator(wrapped);
};
```

**Step 1.3**: Add new route in `services/agent/src/routes/chat/chat.controller.ts`:

```typescript
export const MakeSendChatMessageAiStreamRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminRead.literals[0]])(ctx))(
    AgentEndpoints.Chat.Custom.AiStream,
    ({ body }) => {
      return TE.tryCatch(() => {
        const streamGenerator = sendChatMessageStream(body)(ctx);
        const stream = createAiDataStream(streamGenerator, {
          provider: body.aiConfig?.provider,
        });
        return Promise.resolve({
          statusCode: 200,
          stream,
          headers: {
            "Content-Type": "text/plain; charset=x-user-defined",
          },
        } satisfies HTTPStreamResponse);
      }, ServerError.fromUnknown);
    },
  );
};
```

**Step 1.4**: Add endpoint constant `AgentEndpoints.Chat.Custom.AiStream` to `@liexp/shared/lib/endpoints/agent/index.ts`.

**Risk**: The AI SDK's `writableStreamFromAsyncGenerator` expects specific part types. We must verify the exact part type names and structure from the AI SDK v2 API. The `tool-call-delta` type may need separate `tool-call-start` and `tool-call-end` parts.

### Phase 2: Client Hook — Replace `useStreamingChat` with `useChat`

**Step 2.1**: Create `services/admin/src/hooks/useStreamingChat.ts` (rewritten):

```typescript
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useConfiguration } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { useCallback, useRef } from "react";
import { useChat } from "ai/react";
import { useChatAutoCompact } from "./chat/useChatAutoCompact.js";
import { useChatCompact } from "./chat/useChatCompact.js";

interface UseStreamingChatOptions {
  proxyUrl?: string;
  initialAutoCompact?: boolean;
  onAutoCompactChange?: (value: boolean) => void;
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const {
    proxyUrl = "/api/proxy/agent/chat/stream",
    initialAutoCompact = false,
    onAutoCompactChange,
  } = options;

  const config = useConfiguration();
  const baseUrl = config.platforms.admin.url;

  const { autoCompact, autoCompactRef, toggleAutoCompact } = useChatAutoCompact({
    initialValue: initialAutoCompact,
    onChange: onAutoCompactChange,
  });

  const abortRef = useRef<AbortController | null>(null);

  const chat = useChat({
    api: `${baseUrl}${proxyUrl}`,
    headers: () => {
      const token = getAuthFromLocalStorage();
      return token ? { Authorization: token } : {};
    },
    onError: async (error) => {
      // Auto-compact on context limit errors
      if (autoCompactRef.current && /token|context|limit|exceed/i.test(error.message)) {
        const conversationId = chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].id
          : undefined;
        if (conversationId) {
          try {
            const { new_conversation_id, summary } = await callCompactApi(
              conversationId, baseUrl,
            );
            // Clear messages and set compacted state
            chat.setMessages([]);
            // Store compacted conversation ID in chat metadata
          } catch {
            // compact failed silently
          }
        }
      }
    },
  });

  const { compact } = useChatCompact({
    conversationId: chat.experimental_getThreadId?.(),
    baseUrl,
    setState: () => {}, // no-op — useChat manages state
  });

  const clearMessages = useCallback(() => {
    chat.setMessages([]);
  }, [chat.setMessages]);

  const loadConversation = useCallback(
    (conversationId: string, messages: import("@liexp/io/lib/http/Chat.js").ChatMessage[]) => {
      // Convert ChatMessage[] → UIMessage[] for useChat
      const uiMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system" | "tool",
        content: msg.content,
        createdAt: new Date(msg.timestamp),
        toolInvocations: msg.tool_calls?.map((tc) => ({
          toolCallId: tc.id,
          toolName: tc.function.name,
          args: JSON.parse(tc.function.arguments ?? "{}"),
          state: "result",
        })) ?? [],
      }));
      chat.setMessages(uiMessages);
      // Store conversation ID in thread ID
    },
    [chat.setMessages],
  );

  const sendMessage = useCallback(
    async (request: import("@liexp/io/lib/http/Chat.js").ChatRequest, aiConfig?: import("@liexp/io/lib/http/Chat.js").AIConfig) => {
      if (abortRef.current) abortRef.current.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      // Add user message immediately
      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: request.message,
        createdAt: new Date(),
      };
      chat.append(userMessage);

      try {
        await chat.send({
          body: {
            ...request,
            aiConfig,
          },
          abortController,
        });
      } catch {
        abortRef.current = null;
      }
    },
    [chat],
  );

  return {
    ...chat,
    sendMessage,
    clearMessages,
    loadConversation,
    compact,
    autoCompact,
    toggleAutoCompact,
    // Map isLoading to status
    isLoading: chat.status === "streaming" || chat.status === "submitted",
  };
};
```

**Step 2.2**: Delete `services/admin/src/hooks/chat/useSendMessage.ts`.

**Step 2.3**: Simplify `services/admin/src/hooks/chat/types.ts` — remove `INITIAL_STATE`, `estimateTokens`, and `StreamingChatState`. Keep only types still needed elsewhere.

### Phase 3: Message Rendering — Adapt ChatUI to UIMessage

**Step 3.1**: Update `services/admin/src/components/chat/AdminChat.tsx`:

- Remove destructured: `streamingContent`, `thinkingContent`, `activeToolCalls`, `streamingMessage`
- Replace `messages` with `chat.messages` (now `UIMessage[]`)
- Remove `streamingMessage` memo — no longer needed
- Pass `chat.messages` directly to `ChatUI`
- Keep `usedProvider` from `chat.lastMessage?.experimental_providerMetadata?.usedProvider`

**Step 3.2**: Update `packages/@liexp/ui/src/components/Chat/ChatUI.tsx`:

- Change `messages` prop type from `ChatMessage[]` to `UIMessage[]` (from `ai`)
- Update rendering logic:
  - For each message, iterate `message.parts`
  - `text` parts → `<ContentMessage>`
  - `tool-invocation` parts → `<ToolMessage>` with appropriate state
  - Handle `partial-tool-call` parts for streaming tool calls
- Remove `streamingMessage` prop — streaming is now in `messages[messages.length-1]` with partial parts
- Remove `tokenUsage` prop — usage is in `chat.usage`
- Keep `context` prop for context window info (pass via message metadata)

**Step 3.3**: Delete `packages/@liexp/ui/src/components/Chat/StreamingMessage.tsx`.

**Step 3.4**: Minor update to `packages/@liexp/ui/src/components/Chat/ChatInput.tsx` — no structural changes needed, just ensure it works with the new `sendMessage` signature.

### Phase 4: Provider & Context — Wire up provider selection

**Step 4.1**: In `AdminChat.tsx`, pass `aiConfig` via `sendMessage` body options (already in Phase 2.1).

**Step 4.2**: Server adapter reads `aiConfig` from request body — no changes needed to existing flow since `sendChatMessageStream` already accepts `aiConfig`.

**Step 4.3**: Keep `ProviderSelector` component — remove its internal auth logic (now handled by transport headers).

### Phase 5: Cleanup

**Step 5.1**: Remove `AdminChat.tsx` state for `streamingContent`, `thinkingContent`, `activeToolCalls`, `streamingMessage` (done in Phase 3.1).

**Step 5.2**: Remove `INITIAL_STATE` from `types.ts` (done in Phase 2.3).

**Step 5.3**: Remove `estimateTokens` helper (done in Phase 2.3).

**Step 5.4**: Rewrite tests — `useStreamingChat.test.ts` → test the new hook wrapping `useChat`.

**Step 5.5**: Simplify `ChatUI` props — remove `streamingMessage`, `tokenUsage`, `context` props.

## Progress

### Completed
- **Phase 1**: Server adapter built and registered (`MakeSendChatMessageAISTreamRoute`)
- **Phase 2**: Client hook rewritten — `useStreamingChat` now wraps `@ai-sdk/react`'s `useChat`
  - Added `@ai-sdk/react` dependency to admin service
  - Uses `Chat` + `DefaultChatTransport` from `ai` for custom API routing
  - `transformUIMessageToChatMessage` converts AI SDK `UIMessage[]` → `@liexp/io` `ChatMessage[]` for `ChatUI` compatibility
  - `sendMessageWrapped` uses `sendMessage({ text })` API (AI SDK v7)
  - `streamingMessage` computed from latest `UIMessage` parts
  - `status` mapped: `"streaming"` → `isLoading: true`, `"submitted"` → `isLoading: true`
- **Phase 3**: `AdminChat.tsx` cleaned up (unused state/refs removed, adapted to new hook signature)

### In Progress
- Verifying both `agent` and `admin` services build cleanly

### Not Started
- Phase 3.2: Update `ChatUI.tsx` to render `UIMessage.parts` (may not be needed if `ChatMessage` transformation is sufficient)
- Phase 3.3: Delete `StreamingMessage.tsx` (replaced by AI SDK streaming in `useStreamingChat`)
- Phase 4: Provider/model selection wiring
- Phase 5: Cleanup (`useSendMessage.ts`, `types.ts`, tests)

## Key API Differences (AI SDK v7)

| Feature | AI SDK v7 API |
|---------|---------------|
| Hook | `useChat({ chat })` from `@ai-sdk/react` |
| Transport | `DefaultChatTransport({ api })` from `ai` |
| Send message | `sendMessage({ text })` (not `append` + `send`) |
| Set messages | `setMessages(UIMessage[])` |
| Status values | `'submitted' \| 'streaming' \| 'ready' \| 'error'` |
| Message parts | `UIMessage.parts[]` with types: `'text'`, `'tool-call'`, `'tool-result'`, `'reasoning'` |
| Loading | `status === 'streaming' \| 'submitted'` |

## Files Changed (Current State)

| File | Status |
|------|--------|
| `services/agent/package.json` | Added `ai` v7.0.15 |
| `services/agent/src/routes/chat/chat.controller.ts` | Added `MakeSendChatMessageAISTreamRoute` |
| `services/agent/src/routes/index.ts` | Registered new route |
| `services/admin/package.json` | Added `@ai-sdk/react` |
| `services/admin/src/hooks/useStreamingChat.ts` | **Rewritten** — wraps `useChat` from `@ai-sdk/react` |
| `services/admin/src/components/chat/AdminChat.tsx` | **Cleaned up** — removed unused state/refs |

| File | Action |
|------|--------|
| `services/agent/package.json` | Add `ai` dependency |
| `services/agent/src/flows/chat/ai-sdk.adapter.ts` | **Create** — stream event adapter |
| `services/agent/src/routes/chat/chat.controller.ts` | Add new AI stream route |
| `packages/@liexp/shared/src/endpoints/agent/index.ts` | Add `AiStream` endpoint constant |
| `services/admin/src/hooks/useStreamingChat.ts` | **Rewrite** — thin wrapper around `useChat` |
| `services/admin/src/hooks/chat/useSendMessage.ts` | **Delete** |
| `services/admin/src/hooks/chat/types.ts` | Remove `INITIAL_STATE`, `estimateTokens`, `StreamingChatState` |
| `services/admin/src/components/chat/AdminChat.tsx` | Simplify — remove streaming state, wire `useChat` |
| `packages/@liexp/ui/src/components/Chat/ChatUI.tsx` | Adapt to render `UIMessage.parts` |
| `packages/@liexp/ui/src/components/Chat/StreamingMessage.tsx` | **Delete** |
| `packages/@liexp/ui/src/components/Chat/ChatInput.tsx` | Minor: no structural changes |
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

- **Server adapter**: Must correctly map custom SSE events to AI SDK's DataStream format. The AI SDK expects specific protocol parts (`text_delta`, `tool_call_delta`, etc.). Verify exact part types from AI SDK v2 docs.
- **Tool call rendering**: `UIMessagePart.tool-invocation` has a different structure than `ChatMessage.tool_calls`. Need to handle `partial-call` and `call` states.
- **Conversation loading**: Must convert `ChatMessage[]` → `UIMessage[]` when loading history. `ChatMessage.tool_calls` → `toolInvocations` array.
- **Thread/conversation ID**: `useChat` manages its own thread ID. Need to sync with existing `conversationId` from the backend.
- **Abort handling**: `useChat` has built-in abort via `AbortController`. Need to ensure auto-compact logic still triggers on context limit errors.
- **Thinking content**: `@ai-sdk/react` may not expose reasoning/thinking content separately. May need to store in message metadata.

## Implementation Order

1. Phase 1 (server adapter) — no client changes, can be deployed independently
2. Phase 2 (client hook) — swap hook implementation
3. Phase 3 (message rendering) — adapt UI to new message format
4. Phase 4 (provider wiring) — ensure provider selection works
5. Phase 5 (cleanup) — remove dead code, update tests
