import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { aiConfigToProviderOverride } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type AIConfig,
  type AgentType,
  type ChatMessage,
  type ChatResponse,
  type ChatStreamEvent,
  type ResourceContext,
} from "@liexp/io/lib/http/Chat.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AIMessage } from "langchain";
import { type AgentContext } from "../../context/context.type.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LangChainToolCall {
  id: string;
  type?: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ModelRequestMessage {
  additional_kwargs?: {
    tool_calls?: LangChainToolCall[];
  };
}

// ---------------------------------------------------------------------------
// Model context limits
// ---------------------------------------------------------------------------

const MODEL_CONTEXT_LIMITS: Record<string, number> = {
  "gpt-4o": 128000,
  "gemma-4-e4b-it": 32768,
  "gemma-4-e2b-it": 32768,
  "qwen3.5-4b": 32768,
  "grok-4-fast": 200000,
  "claude-sonnet-4-20250514": 200000,
  "claude-3-7-sonnet-latest": 200000,
  "claude-3-5-haiku-latest": 200000,
};

const getModelContextLimit = (model?: string): number | undefined =>
  model ? MODEL_CONTEXT_LIMITS[model] : undefined;

// ---------------------------------------------------------------------------
// In-memory conversation store
// ---------------------------------------------------------------------------

const conversations = new Map<string, ChatMessage[]>();

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export const buildEnhancedMessage = (
  message: string,
  resource_context?: ResourceContext,
): string => {
  if (!resource_context) return message;
  const idPart = resource_context.recordId
    ? ` with ID ${resource_context.recordId}`
    : "";
  return `${message}\n\n[Context: User is currently ${resource_context.action ?? "viewing"} ${resource_context.resource}${idPart}]`;
};

const makeContentDelta = (
  content: string,
  messageId: string,
  thinking = false,
): ChatStreamEvent => ({
  type: "content_delta",
  timestamp: new Date().toISOString(),
  content,
  message_id: messageId,
  ...(thinking ? { thinking: true } : {}),
});

/** State for the incremental <think>…</think> tag parser. */
interface ThinkState {
  inside: boolean;
  buffer: string;
}

export const emptyThinkState = (): ThinkState => ({
  inside: false,
  buffer: "",
});

/**
 * Check whether `text` ends with a partial prefix of "<think>".
 * Returns the prefix length (0 = no partial match).
 */
const THINK_OPEN = "<think>";
export const trailingPartialTag = (text: string): number => {
  for (let i = THINK_OPEN.length - 1; i >= 1; i--) {
    if (text.endsWith(THINK_OPEN.slice(0, i))) return i;
  }
  return 0;
};

/**
 * Pure parser: consume `text` given current `state`, returning the events to
 * emit and the next state. No side effects.
 */
export const parseThinkContent = (
  text: string,
  state: ThinkState,
  messageId: string,
): [ChatStreamEvent[], ThinkState] => {
  const events: ChatStreamEvent[] = [];
  let remaining = state.buffer + text;
  let inside = state.inside;
  let buffer = "";

  while (remaining.length > 0) {
    if (inside) {
      const closeIdx = remaining.indexOf("</think>");
      if (closeIdx !== -1) {
        if (closeIdx > 0) {
          events.push(
            makeContentDelta(remaining.slice(0, closeIdx), messageId, true),
          );
        }
        inside = false;
        remaining = remaining.slice(closeIdx + "</think>".length);
      } else {
        // Whole remaining chunk is still inside the think block
        buffer = remaining;
        remaining = "";
      }
    } else {
      const openIdx = remaining.indexOf(THINK_OPEN);
      if (openIdx !== -1) {
        if (openIdx > 0) {
          events.push(makeContentDelta(remaining.slice(0, openIdx), messageId));
        }
        inside = true;
        remaining = remaining.slice(openIdx + THINK_OPEN.length);
      } else {
        const partial = trailingPartialTag(remaining);
        if (partial > 0) {
          const safe = remaining.slice(0, remaining.length - partial);
          if (safe) events.push(makeContentDelta(safe, messageId));
          buffer = remaining.slice(remaining.length - partial);
        } else {
          events.push(makeContentDelta(remaining, messageId));
        }
        remaining = "";
      }
    }
  }

  return [events, { inside, buffer }];
};

// ---------------------------------------------------------------------------
// Stream event processing
// ---------------------------------------------------------------------------

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

interface StreamState {
  contentAccumulator: string;
  tokens: TokenUsage;
  think: ThinkState;
}

const initialStreamState = (): StreamState => ({
  contentAccumulator: "",
  tokens: { promptTokens: 0, completionTokens: 0 },
  think: emptyThinkState(),
});

const extractTokenUsage = (chunk: AIMessage): TokenUsage | null => {
  const meta = (chunk as unknown as { usage_metadata?: unknown })
    .usage_metadata;
  if (!meta || typeof meta !== "object") return null;
  const u = meta as { input_tokens?: number; output_tokens?: number };
  if (u.input_tokens === undefined && u.output_tokens === undefined)
    return null;
  return {
    promptTokens: u.input_tokens ?? 0,
    completionTokens: u.output_tokens ?? 0,
  };
};

export const isSupervisorEvent = (event: { metadata?: unknown }): boolean =>
  (event.metadata as { langgraph_node?: string } | undefined)
    ?.langgraph_node === "supervisor";

/**
 * Pure per-event handler. Returns the list of events to yield and the updated
 * stream state. No side effects, easy to unit-test.
 */
export const processStreamEvent = (
  event: {
    event: string;
    name?: string;
    run_id?: string;
    data: unknown;
    metadata?: unknown;
  },
  state: StreamState,
  messageId: string,
): [ChatStreamEvent[], StreamState] => {
  if (event.event === "on_chat_model_stream") {
    if (isSupervisorEvent(event)) return [[], state];

    // LangGraph serializes AIMessageChunk as { lc, type, id, kwargs: { content, ... } }.
    // Support both the plain object form and the serialized form.
    const rawChunk = (event.data as { chunk?: Record<string, unknown> }).chunk;
    if (!rawChunk) return [[], state];
    const chunk = rawChunk as unknown as AIMessage;

    // Extract text content from the chunk, handling multiple formats:
    // - raw string content
    // - array of content parts [{type: 'text', text: '...'}]
    // - serialized form via kwargs
    const content: string = (() => {
      if (typeof rawChunk.content === "string") {
        return rawChunk.content;
      }
      if (Array.isArray(rawChunk.content)) {
        return rawChunk.content
          .filter((part: any) => part.type === "text")
          .map((part: any) => String(part.text ?? ""))
          .join("");
      }
      const kwContent = (rawChunk.kwargs as Record<string, unknown> | undefined)
        ?.content;
      if (typeof kwContent === "string") {
        return kwContent;
      }
      if (Array.isArray(kwContent)) {
        return kwContent
          .filter((part: any) => part.type === "text")
          .map((part: any) => String(part.text ?? ""))
          .join("");
      }
      return "";
    })();

    const tokenUpdate = extractTokenUsage(chunk);
    const tokens = tokenUpdate
      ? {
          promptTokens: tokenUpdate.promptTokens,
          completionTokens: tokenUpdate.completionTokens,
        }
      : state.tokens;

    if (!content) {
      return [[], { ...state, tokens }];
    }

    const [deltaEvents, nextThink] = parseThinkContent(
      content,
      state.think,
      messageId,
    );

    return [
      deltaEvents,
      {
        contentAccumulator: state.contentAccumulator + content,
        tokens,
        think: nextThink,
      },
    ];
  }

  if (event.event === "on_chain_stream") {
    try {
      const chunk = event.data as {
        chunk: Record<string, { messages?: ModelRequestMessage[] }>;
      };

      // Handle both single-agent format (model_request) and multi-agent format (node names)
      let messages: ModelRequestMessage[] | undefined;
      if (chunk?.chunk?.model_request?.messages) {
        messages = chunk.chunk.model_request.messages;
      } else {
        // Check for messages in any node (platform, researcher, etc.)
        for (const nodeData of Object.values(chunk?.chunk || {})) {
          if (nodeData?.messages) {
            messages = nodeData.messages;
            break;
          }
        }
      }

      if (!messages) return [[], state];

      const events: ChatStreamEvent[] = [];
      for (const msg of messages) {
        const toolCalls = msg.additional_kwargs?.tool_calls;
        if (toolCalls) {
          for (const tc of toolCalls) {
            events.push({
              type: "tool_call_start",
              timestamp: new Date().toISOString(),
              tool_call: {
                id: tc.id,
                name: tc.function.name,
                arguments: tc.function.arguments,
              },
            } satisfies ChatStreamEvent);
          }
        }
      }
      return [events, state];
    } catch {
      return [[], state];
    }
  }

  if (event.event === "on_tool_start") {
    const rawInput = (event.data as { input: unknown }).input;
    // LangGraph passes tool input as a pre-serialized JSON string; pass it through
    // as-is. Only stringify if it's already a plain object.
    const arguments_ =
      typeof rawInput === "string" ? rawInput : JSON.stringify(rawInput);
    return [
      [
        {
          type: "tool_call_start",
          timestamp: new Date().toISOString(),
          tool_call: {
            id: event.run_id ?? uuid(),
            name: event.name ?? "unknown",
            arguments: arguments_,
          },
        } satisfies ChatStreamEvent,
      ],
      state,
    ];
  }

  if (event.event === "on_tool_end") {
    const toolOutput = (event.data as { output: unknown }).output;
    // LangGraph wraps tool results in ToolMessage objects; extract the plain string content.
    const extractResult = (output: unknown): string => {
      if (typeof output === "string") return output;
      const content = (output as any)?.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .filter((c: any) => c.type === "text")
          .map((c: any) => String(c.text ?? ""))
          .join("");
      }
      return JSON.stringify(output);
    };
    return [
      [
        {
          type: "tool_call_end",
          timestamp: new Date().toISOString(),
          tool_call: {
            id: event.run_id ?? uuid(),
            name: event.name ?? "unknown",
            result: extractResult(toolOutput),
          },
        } satisfies ChatStreamEvent,
      ],
      state,
    ];
  }

  if (event.event === "on_chain_end") {
    try {
      // Check for ToolMessage results in LangGraph chain end events
      const data = event.data as {
        output?: {
          messages?: {
            lc?: number;
            type?: string;
            id?: string[];
            kwargs?: {
              content?: string;
              tool_call_id?: string;
              name?: string;
            };
          }[];
        };
      };

      const messages = data?.output?.messages;
      if (!messages) return [[], state];

      const events: ChatStreamEvent[] = [];
      for (const msg of messages) {
        // Look for ToolMessage objects
        if (
          msg.lc === 1 &&
          msg.type === "constructor" &&
          msg.id?.[msg.id.length - 1] === "ToolMessage" &&
          msg.kwargs?.tool_call_id &&
          msg.kwargs?.name
        ) {
          events.push({
            type: "tool_call_end",
            timestamp: new Date().toISOString(),
            tool_call: {
              id: msg.kwargs.tool_call_id,
              name: msg.kwargs.name,
              result: msg.kwargs.content ?? "",
            },
          } satisfies ChatStreamEvent);
        }
      }
      return [events, state];
    } catch {
      return [[], state];
    }
  }

  return [[], state];
};

// ---------------------------------------------------------------------------
// Agent resolution
// ---------------------------------------------------------------------------

const getOrCreateAgent =
  (agentType?: AgentType, aiConfig?: AIConfig) => (ctx: AgentContext) => {
    if (!agentType && !aiConfig) {
      return TE.right(ctx.agent.agent);
    }
    const override = aiConfig
      ? aiConfigToProviderOverride(aiConfig)
      : undefined;
    return pipe(
      ctx.agentFactory(agentType, override),
      TE.mapLeft(ServerError.fromUnknown),
    );
  };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const sendChatMessage =
  (payload: {
    message: string;
    conversation_id: string | null;
    resource_context?: ResourceContext;
    aiConfig?: AIConfig;
    agent_type?: AgentType;
  }) =>
  (ctx: AgentContext): TE.TaskEither<ServerError, ChatResponse> => {
    const conversationId = payload.conversation_id ?? uuid();
    const enhancedMessage = buildEnhancedMessage(
      payload.message,
      payload.resource_context,
    );

    return pipe(
      getOrCreateAgent(payload.agent_type, payload.aiConfig)(ctx),
      TE.chain((agent) =>
        TE.tryCatch(
          () =>
            agent.invoke(
              { messages: [enhancedMessage] },
              {
                configurable: { thread_id: conversationId },
                recursionLimit: 50,
              },
            ),
          ServerError.fromUnknown,
        ),
      ),
      TE.map((result) => {
        const { messages } = result as { messages: AIMessage[] };
        const lastMessage = messages[messages.length - 1];
        const content =
          typeof lastMessage?.content === "string"
            ? lastMessage.content
            : JSON.stringify(lastMessage?.content ?? "No response");

        const userMessage: ChatMessage = {
          id: uuid(),
          content: payload.message,
          role: "user",
          timestamp: new Date().toISOString(),
        };
        const assistantMessage: ChatMessage = {
          id: lastMessage.id ?? uuid(),
          content,
          role: "assistant",
          timestamp: new Date().toISOString(),
        };

        conversations.set(conversationId, [
          ...(conversations.get(conversationId) ?? []),
          userMessage,
          assistantMessage,
        ]);

        return {
          message: assistantMessage,
          conversationId,
          usedProvider: payload.aiConfig
            ? {
                provider: payload.aiConfig.provider,
                model: payload.aiConfig.model ?? "gpt-4o",
              }
            : undefined,
        };
      }),
    );
  };

export const getChatConversation =
  (conversationId: string) =>
  (_ctx: AgentContext): TE.TaskEither<Error, ChatMessage[]> =>
    TE.right(conversations.get(conversationId) ?? []);

export const listChatConversations =
  (_query: { limit?: number; offset?: number }) =>
  (
    _ctx: AgentContext,
  ): TE.TaskEither<
    Error,
    {
      total: number;
      data: {
        id: string;
        messages: ChatMessage[];
        created_at: string;
        updated_at: string;
      }[];
    }
  > =>
    TE.right({
      total: conversations.size,
      data: Array.from(conversations.entries()).map(([id, messages]) => ({
        id,
        messages,
        created_at: messages[0]?.timestamp ?? new Date().toISOString(),
        updated_at:
          messages[messages.length - 1]?.timestamp ?? new Date().toISOString(),
      })),
    });

export const deleteChatConversation =
  (conversationId: string) =>
  (_ctx: AgentContext): TE.TaskEither<Error, boolean> =>
    TE.right(conversations.delete(conversationId));

export const sendChatMessageStream = (payload: {
  message: string;
  conversation_id: string | null;
  resource_context?: ResourceContext;
  aiConfig?: AIConfig;
  agent_type?: AgentType;
  /** Optional hook called with every raw LangGraph streamEvent before processing. */
  onRawEvent?: (event: unknown) => void;
}) => {
  return async function* (ctx: AgentContext): AsyncGenerator<ChatStreamEvent> {
    const conversationId = payload.conversation_id ?? uuid();
    const messageId = uuid();
    const enhancedMessage = buildEnhancedMessage(
      payload.message,
      payload.resource_context,
    );

    ctx.logger.debug.log(
      "sendChatMessageStream — agent_type: %s, aiConfig: %O",
      payload.agent_type,
      payload.aiConfig,
    );

    try {
      const agentResult = await getOrCreateAgent(
        payload.agent_type,
        payload.aiConfig,
      )(ctx)();

      if (agentResult._tag === "Left") {
        yield {
          type: "error",
          timestamp: new Date().toISOString(),
          error: "Failed to create agent with requested provider",
        } satisfies ChatStreamEvent;
        return;
      }

      const agent = agentResult.right;
      const model = payload.aiConfig?.model ?? "gpt-4o";
      const contextTotal = getModelContextLimit(model);

      yield {
        type: "message_start",
        timestamp: new Date().toISOString(),
        message_id: messageId,
        role: "assistant",
        usedProvider: payload.aiConfig
          ? {
              provider: payload.aiConfig.provider,
              model: payload.aiConfig.model ?? "gpt-4o",
            }
          : undefined,
        context: contextTotal ? { total: contextTotal } : undefined,
      } satisfies ChatStreamEvent;

      let state = initialStreamState();
      // Accumulate visible (non-thinking) content from the content_delta events
      // we actually emit rather than from raw LangGraph chunks. This prevents
      // duplicates when LangGraph or the provider sends both per-token deltas
      // AND a final "summary" chunk that replays the full response.
      let visibleContent = "";

      for await (const event of agent.streamEvents(
        { messages: [enhancedMessage] },
        {
          version: "v2",
          configurable: { thread_id: conversationId },
          recursionLimit: 50,
        },
      )) {
        if (!event) continue;

        ctx.logger.debug.log("stream event [%s]: %O", event.event, event.data);

        payload.onRawEvent?.(event);

        const [events, nextState] = processStreamEvent(
          event as Parameters<typeof processStreamEvent>[0],
          state,
          messageId,
        );
        state = nextState;
        for (const e of events) {
          yield e;
          if (e.type === "content_delta" && !e.thinking) {
            visibleContent += e.content ?? "";
          }
        }
      }

      // Flush any buffered partial think-tag fragment that was never completed
      // (e.g. response ends with a bare "<" that looked like the start of <think>).
      if (state.think.buffer) {
        visibleContent += state.think.buffer;
      }

      const finalContent = visibleContent || "No response generated";

      ctx.logger.debug.log(
        "final content: %s (raw accumulator: %s)",
        finalContent,
        state.contentAccumulator,
      );

      conversations.set(conversationId, [
        ...(conversations.get(conversationId) ?? []),
        {
          id: uuid(),
          content: payload.message,
          role: "user",
          timestamp: new Date().toISOString(),
        },
        {
          id: messageId,
          content: finalContent,
          role: "assistant",
          timestamp: new Date().toISOString(),
        },
      ]);

      const modelLimit = getModelContextLimit(
        payload.aiConfig?.model ?? "gpt-4o",
      );
      const { promptTokens, completionTokens } = state.tokens;

      yield {
        type: "message_end",
        timestamp: new Date().toISOString(),
        message_id: messageId,
        content: finalContent,
        usedProvider: payload.aiConfig
          ? {
              provider: payload.aiConfig.provider,
              model: payload.aiConfig.model ?? "gpt-4o",
            }
          : undefined,
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
        context: modelLimit
          ? { total: modelLimit, used: promptTokens + completionTokens }
          : undefined,
      } satisfies ChatStreamEvent;
    } catch (error) {
      ctx.logger.error.log("stream error: %O", error);
      yield {
        type: "error",
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : "Unknown streaming error",
      } satisfies ChatStreamEvent;
    }
  };
};
