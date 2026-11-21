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
import { isRight } from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AIMessage } from "langchain";
import { type AgentContext } from "../../context/context.type.js";
import { formatMemoriesForPrompt } from "../../memory/client.js";
import {
  type ChatErrorMeta,
  captureChatError,
  toChatErrorEvent,
} from "./chat.errors.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Content part from a LangChain message (string or structured parts array). */
interface TextContentPart {
  type: string;
  text?: string;
}

/**
 * Guard: check whether a value looks like a content part with a `type` field.
 */
const isTextContentPart = (value: unknown): value is TextContentPart =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  typeof (value as TextContentPart).type === "string";

/**
 * Guard: check whether a value looks like an AIMessage (has `content`,
 * optional `usage_metadata`).
 */
const isAIMessageLike = (
  value: unknown,
): value is {
  content: string | unknown[];
  usage_metadata?: { input_tokens?: number; output_tokens?: number };
} => typeof value === "object" && value !== null && "content" in value;

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
  const action = resource_context.action ?? "viewing";
  const { resource, recordId } = resource_context;

  if (!recordId) {
    return `${message}\n\n[Context: User is currently ${action} ${resource}]`;
  }

  // The user is acting on a specific record. Spell out that references like
  // "the given article", "this link", or "the current record" point to it, and
  // that the agent must fetch the record itself rather than asking the user for
  // data it can resolve via the MCP tools / scraper.
  return [
    message,
    "",
    `[Context: User is currently ${action} ${resource} with ID ${recordId}.`,
    `References such as "the given/current record", "this ${resource}", "the article", "the link", or "it" mean ${resource} record ${recordId}.`,
    `Resolve it yourself with the matching find MCP tool (e.g. findLinks, findActors) passing ids: ["${recordId}"] — and for links, scrape the URL it returns — instead of asking the user to paste the content.]`,
  ].join("\n");
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

const addTokens = (a: TokenUsage, b: TokenUsage): TokenUsage => ({
  promptTokens: a.promptTokens + b.promptTokens,
  completionTokens: a.completionTokens + b.completionTokens,
});

const zeroTokens = (): TokenUsage => ({ promptTokens: 0, completionTokens: 0 });

/** Total usage of a run: finished model calls plus the one in flight. */
export const totalTokens = (state: StreamState): TokenUsage =>
  addTokens(state.completedTokens, state.tokens);

interface StreamState {
  contentAccumulator: string;
  /**
   * Reasoning-only text (`reasoning` deltas with empty `content`). Emitted as
   * `thinking` deltas; used as the final answer only when the model produced
   * no visible content at all.
   */
  reasoningAccumulator: string;
  /** Usage of the model call currently in flight (overwritten per chunk). */
  tokens: TokenUsage;
  /** Usage summed over model calls already finished in this run. */
  completedTokens: TokenUsage;
  think: ThinkState;
  /**
   * Whether the current model turn emitted token-by-token content via
   * `on_chat_model_stream`. Used to avoid re-emitting the full message at
   * `on_chat_model_end` for providers that genuinely stream. Reset at each
   * `on_chat_model_end`.
   */
  sawStreamDelta: boolean;
}

const initialStreamState = (): StreamState => ({
  contentAccumulator: "",
  reasoningAccumulator: "",
  tokens: zeroTokens(),
  completedTokens: zeroTokens(),
  think: emptyThinkState(),
  sawStreamDelta: false,
});

/** Extract plain text from a message-like object's `content` (string or parts). */
const extractContentText = (raw: { content?: unknown }): string =>
  typeof raw.content === "string"
    ? raw.content
    : Array.isArray(raw.content)
      ? raw.content
          .filter(isTextContentPart)
          .map((part) => String(part.text ?? ""))
          .join("")
      : "";

const extractTokenUsage = (chunk: AIMessage): TokenUsage | null => {
  const meta =
    (isAIMessageLike(chunk) ? chunk.usage_metadata : undefined) ?? null;
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

    // Native streaming yields real AIMessageChunks: content is a string or an
    // array of content parts ([{ type: "text", text: "..." }]).
    const content: string =
      typeof rawChunk.content === "string"
        ? rawChunk.content
        : Array.isArray(rawChunk.content)
          ? rawChunk.content
              .filter(isTextContentPart)
              .map((part) => String(part.text ?? ""))
              .join("")
          : "";

    // Thinking-mode models (rhino-coder, qwen3.6-35b-a3b) stream into
    // `reasoning` and may leave `content` empty. Reasoning is surfaced as a
    // `thinking` delta, never as visible answer text; the flow falls back to
    // the accumulated reasoning only if no visible content shows up at all.
    const reasoning =
      typeof rawChunk.reasoning === "string"
        ? rawChunk.reasoning
        : Array.isArray(rawChunk.reasoning)
          ? rawChunk.reasoning
              .filter(isTextContentPart)
              .map((part) => String(part.text ?? ""))
              .join("")
          : "";

    const tokenUpdate = extractTokenUsage(chunk);
    const tokens = tokenUpdate ?? state.tokens;

    if (!content && !reasoning) {
      return [[], { ...state, tokens }];
    }

    if (!content) {
      return [
        [makeContentDelta(reasoning, messageId, true)],
        {
          ...state,
          reasoningAccumulator: state.reasoningAccumulator + reasoning,
          tokens,
          sawStreamDelta: true,
        },
      ];
    }

    const [deltaEvents, nextThink] = parseThinkContent(
      content,
      state.think,
      messageId,
    );

    return [
      deltaEvents,
      {
        ...state,
        contentAccumulator: state.contentAccumulator + content,
        tokens,
        think: nextThink,
        sawStreamDelta: true,
      },
    ];
  }

  // When the chat model does not stream token-by-token (streaming: false — the
  // mode we use so LocalAI reasoning models don't corrupt tool-call routing),
  // the full assistant message arrives here instead of via on_chat_model_stream.
  // Emit its visible content as a single content_delta. Skip turns whose content
  // is empty (e.g. a tool-call-only turn) and skip when this turn already
  // streamed deltas, to avoid duplicating content for genuine streaming providers.
  if (event.event === "on_chat_model_end") {
    const output = (event.data as { output?: unknown }).output;
    const tokenUpdate =
      output && isAIMessageLike(output)
        ? extractTokenUsage(output as AIMessage)
        : null;
    // The model call is over: commit its usage to the run total and reset the
    // in-flight counter so the next call in the tool loop adds, not overwrites.
    const completedTokens = addTokens(
      state.completedTokens,
      tokenUpdate ?? state.tokens,
    );
    const tokens = zeroTokens();

    if (state.sawStreamDelta || !output) {
      return [[], { ...state, tokens, completedTokens, sawStreamDelta: false }];
    }

    const content = extractContentText(output);
    if (!content) {
      return [[], { ...state, tokens, completedTokens, sawStreamDelta: false }];
    }

    const [deltaEvents, nextThink] = parseThinkContent(
      content,
      state.think,
      messageId,
    );
    return [
      deltaEvents,
      {
        ...state,
        contentAccumulator: state.contentAccumulator + content,
        tokens,
        completedTokens,
        think: nextThink,
        sawStreamDelta: false,
      },
    ];
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
      if (!isAIMessageLike(output)) return JSON.stringify(output);
      const content = output.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .filter(isTextContentPart)
          .map((c) => String(c.text ?? ""))
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

  return [[], state];
};

// ---------------------------------------------------------------------------
// Agent resolution
// ---------------------------------------------------------------------------

/** Map agent type to mem0 scope for strict isolation between agents. */
const agentIdForScope = (agentType?: AgentType): string =>
  agentType === "researcher" ? "lies-exposed-researcher" : "lies-exposed-agent";

/**
 * Retrieve relevant memories for a user message. Returns the enhanced message
 * with injected memories, or the original message if memory is unavailable.
 */
const injectMemories = async (
  message: string,
  ctx: AgentContext,
  agentType?: AgentType,
): Promise<string> => {
  const memoryClient = ctx.memoryClient;
  if (!memoryClient) return message;

  try {
    const result = await memoryClient.searchMemories(
      message,
      agentIdForScope(agentType),
      5,
    )();
    if (isRight(result)) {
      const results = result.right;
      if (results.length === 0) return message;
      const formatted = formatMemoriesForPrompt(results);
      return `${message}\n\n${formatted}`;
    }
    ctx.logger.warn.log("Memory search returned left: %s", String(result.left));
    return message;
  } catch (_error) {
    ctx.logger.warn.log("Memory retrieval failed, continuing without memories");
    return message;
  }
};

/** Provider/model reported to the client; falls back to the configured model. */
const usedProviderOf = (
  ctx: AgentContext,
  aiConfig?: AIConfig,
): { provider: AIConfig["provider"]; model: string } | undefined =>
  aiConfig
    ? {
        provider: aiConfig.provider,
        model: aiConfig.model ?? ctx.env.LOCALAI_MODEL,
      }
    : undefined;

/**
 * Post-turn bookkeeping shared by the blocking and streaming paths: append the
 * exchange to the in-memory conversation store and fire-and-forget the exchange
 * to mem0. Memory failures never affect the response.
 */
const recordTurn = (
  ctx: AgentContext,
  turn: {
    conversationId: string;
    agentType?: AgentType;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
  },
): void => {
  const { conversationId, agentType, userMessage, assistantMessage } = turn;
  conversations.set(conversationId, [
    ...(conversations.get(conversationId) ?? []),
    userMessage,
    assistantMessage,
  ]);

  const memoryClient = ctx.memoryClient;
  if (!memoryClient) return;
  void pipe(
    memoryClient.addMemory(
      `User: ${userMessage.content}\n\nAssistant: ${assistantMessage.content}`,
      agentIdForScope(agentType),
    ),
    TE.match(
      (e: unknown) => {
        ctx.logger.debug.log(
          "Memory storage failed (non-fatal): %s",
          String(e),
        );
      },
      () => {
        ctx.logger.debug.log(
          "Memory stored for conversation %s",
          conversationId,
        );
      },
    ),
  )();
};

const EMPTY_CHOICES_MAX_RETRIES = 2;

/**
 * LocalAI occasionally answers a chat completion with HTTP 200 and an empty
 * `choices` array; @langchain/core's BaseChatModel.invoke() then crashes
 * reading `.generations[0][0].message` of undefined. Two attempts to fix
 * this inside the langchain provider (subclassing ChatOpenAI, then patching
 * `configuration.fetch`) were both silently bypassed — createAgent/bindTools
 * ends up invoking the model through a path that discards non-serializable
 * overrides on the model instance (crash stack always names the base
 * `ChatOpenAI`, never our wrapper). Retrying the whole agent turn here, at
 * the one call site that can't be rebuilt out from under us, is the fix that
 * actually holds.
 *
 * Matching on `instanceof TypeError` was tried first and still didn't
 * retry in prod: the error crosses langgraph's `_runWithRetry` /
 * `PregelRunner` layers between the crash site and this call, which can
 * re-wrap it into something that no longer passes `instanceof TypeError`
 * even though the message survives intact. Match on message text alone —
 * specific enough not to collide with an unrelated real error.
 */
const isEmptyChoicesError = (error: unknown): boolean =>
  (error as { message?: unknown } | null)?.message ===
  "Cannot read properties of undefined (reading 'message')";

const invokeAgentWithEmptyChoicesRetry = async (
  agent: unknown,
  input: unknown,
  config: unknown,
): Promise<unknown> => {
  const invoke = (agent as { invoke: (...args: unknown[]) => Promise<unknown> })
    .invoke;
  for (let attempt = 1; attempt <= EMPTY_CHOICES_MAX_RETRIES + 1; attempt++) {
    try {
      return await invoke(input, config);
    } catch (error) {
      if (!isEmptyChoicesError(error) || attempt > EMPTY_CHOICES_MAX_RETRIES) {
        throw error;
      }
    }
  }
  throw new Error("unreachable");
};

/**
 * Converts the agent's final free-text answer into a JSON object matching the
 * caller-provided JSON schema, using the model's tool-calling based structured
 * output. Returns `undefined` on failure so callers can still fall back to
 * parsing the textual content.
 */
const extractStructuredOutput = async (
  ctx: AgentContext,
  request: string,
  answer: string,
  outputSchema: Record<string, unknown>,
): Promise<unknown> => {
  try {
    const model = ctx.langchain.chat.withStructuredOutput(outputSchema, {
      name: "final_answer",
      method: "functionCalling",
    });
    return await model.invoke([
      {
        role: "system",
        content:
          "Convert the assistant answer below into the requested structured output. " +
          "Use ONLY information present in the answer. Use null for any value the answer does not state. Never invent values.",
      },
      {
        role: "user",
        content: `Original request:\n${request}\n\nAssistant answer:\n${answer}`,
      },
    ]);
  } catch (e) {
    ctx.logger.warn.log(
      "Structured output extraction failed, falling back to content: %s",
      e instanceof Error ? e.message : String(e),
    );
    return undefined;
  }
};

const getOrCreateAgent =
  (agentType?: AgentType, aiConfig?: AIConfig) => (ctx: AgentContext) => {
    // Everything routes through the factory. With no type/config it resolves the
    // default "auto" supervisor agent; the factory caches compiled agents so the
    // checkpointer (conversation history) persists across requests.
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

/**
 * Compact trace of the tool calls an agent run made (name, args, and whether
 * the tool returned an error), so a failed or low-quality job can be debugged
 * from the logs without replaying the conversation.
 */
const summarizeToolTrace = (
  messages: readonly unknown[],
): { tool: string; args: string; error: boolean }[] =>
  messages.flatMap((m) => {
    const msg = m as {
      tool_calls?: { name?: string; args?: unknown }[];
      _getType?: () => string;
      name?: string;
      content?: unknown;
    };
    const calls = (msg.tool_calls ?? []).map((c) => ({
      tool: c.name ?? "unknown",
      args: JSON.stringify(c.args ?? {}).slice(0, 200),
      error: false,
    }));
    if (msg._getType?.() === "tool") {
      const content =
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content);
      if (/^error\b/i.test(content.trim())) {
        return [
          ...calls,
          {
            tool: msg.name ?? "unknown",
            args: content.slice(0, 200),
            error: true,
          },
        ];
      }
    }
    return calls;
  });

export const sendChatMessage =
  (payload: {
    message: string;
    conversation_id: string | null;
    resource_context?: ResourceContext;
    aiConfig?: AIConfig;
    agent_type?: AgentType;
    output_schema?: Record<string, unknown>;
  }) =>
  (ctx: AgentContext): TE.TaskEither<ServerError, ChatResponse> => {
    const conversationId = payload.conversation_id ?? uuid();
    const enhancedMessage = buildEnhancedMessage(
      payload.message,
      payload.resource_context,
    );

    // Inject relevant memories from past conversations (gracefully degrades
    // when memory is not configured or unavailable).
    return pipe(
      TE.tryCatch(
        () => injectMemories(enhancedMessage, ctx, payload.agent_type),
        ServerError.fromUnknown,
      ),
      TE.chain((messageWithMemories) =>
        pipe(
          getOrCreateAgent(payload.agent_type, payload.aiConfig)(ctx),
          TE.chain((agent) =>
            TE.tryCatch(
              () =>
                invokeAgentWithEmptyChoicesRetry(
                  agent,
                  { messages: [messageWithMemories] },
                  {
                    configurable: { thread_id: conversationId },
                    recursionLimit: 50,
                  },
                ),
              ServerError.fromUnknown,
            ),
          ),
          TE.chain((result) => {
            const { messages } = result as { messages: AIMessage[] };
            ctx.logger.info.log(
              "chat %s (%s): tool trace %O",
              conversationId,
              payload.agent_type ?? "default",
              summarizeToolTrace(messages),
            );
            const lastMessage = messages[messages.length - 1];
            const content =
              typeof lastMessage?.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage?.content ?? "No response");
            const outputSchema = payload.output_schema;
            if (!outputSchema) {
              return TE.right({ lastMessage, content, structured: undefined });
            }
            return pipe(
              TE.tryCatch(
                () =>
                  extractStructuredOutput(
                    ctx,
                    payload.message,
                    content,
                    outputSchema,
                  ),
                ServerError.fromUnknown,
              ),
              TE.map((structured) => ({ lastMessage, content, structured })),
            );
          }),
          TE.map(({ lastMessage, content, structured }) => {
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
              ...(structured !== undefined
                ? { structured_output: structured }
                : {}),
            };

            recordTurn(ctx, {
              conversationId,
              agentType: payload.agent_type,
              userMessage,
              assistantMessage,
            });

            return {
              message: assistantMessage,
              conversationId,
              usedProvider: usedProviderOf(ctx, payload.aiConfig),
            };
          }),
        ),
      ),
      TE.mapLeft((e) => {
        ctx.logger.error.log(
          "chat %s (%s) failed: %s\n%O",
          conversationId,
          payload.agent_type ?? "default",
          e.message,
          e.details,
        );
        return e;
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

    // Inject relevant memories from past conversations (gracefully degrades
    // when memory is not configured or unavailable).
    const errorMeta: ChatErrorMeta = {
      conversationId,
      agentType: payload.agent_type,
      provider: payload.aiConfig?.provider,
      model: payload.aiConfig?.model,
      messageLength: payload.message.length,
    };
    const messageWithMemories = await injectMemories(
      enhancedMessage,
      ctx,
      payload.agent_type,
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
        ctx.logger.error.log("getOrCreateAgent failed: %O", agentResult.left);
        captureChatError(ctx, agentResult.left, errorMeta);
        yield {
          ...toChatErrorEvent(
            agentResult.left,
            "Failed to create agent with requested provider",
          ),
          error: "Failed to create agent with requested provider",
        } satisfies ChatStreamEvent;
        return;
      }

      const agent = agentResult.right;

      yield {
        type: "message_start",
        timestamp: new Date().toISOString(),
        message_id: messageId,
        role: "assistant",
        usedProvider: usedProviderOf(ctx, payload.aiConfig),
      } satisfies ChatStreamEvent;

      let state = initialStreamState();
      // Accumulate visible (non-thinking) content from the content_delta events
      // we actually emit rather than from raw LangGraph chunks. This prevents
      // duplicates when LangGraph or the provider sends both per-token deltas
      // AND a final "summary" chunk that replays the full response.
      let visibleContent = "";

      for await (const event of agent.streamEvents(
        { messages: [messageWithMemories] },
        {
          version: "v2",
          configurable: { thread_id: conversationId },
          recursionLimit: 50,
        },
      )) {
        if (!event) continue;

        ctx.logger.debug.log("stream event [%s]: %O", event.event, event.data);

        payload.onRawEvent?.(event);

        const [events, nextState] = processStreamEvent(event, state, messageId);
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

      const finalContent =
        visibleContent || state.reasoningAccumulator || "No response generated";

      ctx.logger.debug.log(
        "final content: %s (raw accumulator: %s)",
        finalContent,
        state.contentAccumulator,
      );

      recordTurn(ctx, {
        conversationId,
        agentType: payload.agent_type,
        userMessage: {
          id: uuid(),
          content: payload.message,
          role: "user",
          timestamp: new Date().toISOString(),
        },
        assistantMessage: {
          id: messageId,
          content: finalContent,
          role: "assistant",
          timestamp: new Date().toISOString(),
        },
      });

      const { promptTokens, completionTokens } = totalTokens(state);

      yield {
        type: "message_end",
        timestamp: new Date().toISOString(),
        message_id: messageId,
        content: finalContent,
        usedProvider: usedProviderOf(ctx, payload.aiConfig),
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
      } satisfies ChatStreamEvent;
    } catch (error) {
      ctx.logger.error.log("stream error: %O", error);
      captureChatError(ctx, error, errorMeta);
      yield toChatErrorEvent(
        error,
        "Unknown streaming error",
      ) satisfies ChatStreamEvent;
    }
  };
};
