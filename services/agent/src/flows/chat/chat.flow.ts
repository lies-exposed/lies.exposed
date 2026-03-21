import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { aiConfigToProviderOverride } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type ChatResponse,
  type ChatMessage,
  type ResourceContext,
  type ChatStreamEvent,
  type AIConfig,
  type AgentType,
} from "@liexp/io/lib/http/Chat.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AIMessage } from "langchain";
import { type AgentContext } from "../../context/context.type.js";

// In-memory storage for conversations (in production, use a database)
const conversations = new Map<string, ChatMessage[]>();

/**
 * Get or create an agent with optional agent type and provider override.
 * The default agent from context is only used when no agentType is specified
 * and no aiConfig override is requested.
 */
const getOrCreateAgent =
  (agentType?: AgentType, aiConfig?: AIConfig) => (ctx: AgentContext) => {
    if (!agentType && !aiConfig) {
      // Use the default bootstrapped agent (platform type, default provider)
      return TE.right(ctx.agent.agent);
    }

    const override = aiConfig
      ? aiConfigToProviderOverride(aiConfig)
      : undefined;
    return pipe(
      ctx.agentFactory(agentType, override),
      TE.mapLeft((error) => ServerError.fromUnknown(error)),
    );
  };

export const sendChatMessage =
  (payload: {
    message: string;
    conversation_id: string | null;
    resource_context?: ResourceContext;
    aiConfig?: AIConfig;
    agent_type?: AgentType;
  }) =>
  (ctx: AgentContext): TE.TaskEither<ServerError, ChatResponse> => {
    // Use existing conversation_id or generate a new one
    const conversationId = payload.conversation_id ?? uuid();

    // Build context-enhanced message
    const enhancedMessage = payload.resource_context
      ? `${payload.message}

[Context: User is currently ${payload.resource_context.action ?? "viewing"} ${payload.resource_context.resource}${payload.resource_context.recordId ? ` with ID ${payload.resource_context.recordId}` : ""}]`
      : payload.message;

    return pipe(
      getOrCreateAgent(payload.agent_type, payload.aiConfig)(ctx),
      TE.chain((agent) =>
        TE.tryCatch(
          () =>
            agent.invoke(
              {
                messages: [enhancedMessage],
              },
              {
                configurable: { thread_id: conversationId },
                recursionLimit: 50,
              },
            ),
          (error) => ServerError.fromUnknown(error),
        ),
      ),
      TE.map((result) => {
        // Extract the message content from the agent result
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

        // Store messages in conversation
        const existingMessages = conversations.get(conversationId) ?? [];
        conversations.set(conversationId, [
          ...existingMessages,
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
  (_ctx: AgentContext): TE.TaskEither<Error, ChatMessage[]> => {
    return TE.right(conversations.get(conversationId) ?? []);
  };

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
  > => {
    return TE.right({
      total: conversations.size,
      data: Array.from(conversations.entries()).map(([id, messages]) => ({
        id,
        messages,
        created_at: messages[0]?.timestamp ?? new Date().toISOString(),
        updated_at:
          messages[messages.length - 1]?.timestamp ?? new Date().toISOString(),
      })),
    });
  };

export const deleteChatConversation =
  (conversationId: string) =>
  (_ctx: AgentContext): TE.TaskEither<Error, boolean> => {
    return TE.right(conversations.delete(conversationId));
  };

/**
 * Check if a string ends with a partial match of "<think>" tag.
 * Returns the length of the partial match (0 if none).
 */
const THINK_OPEN_TAG = "<think>";
function getPartialTagMatch(text: string): number {
  for (let i = 1; i < THINK_OPEN_TAG.length; i++) {
    if (text.endsWith(THINK_OPEN_TAG.slice(0, i))) {
      return i;
    }
  }
  return 0;
}

/**
 * Strip <think>...</think> blocks from text (for final stored content).
 */
function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

/**
 * Stream chat messages with tool calls and responses
 * Returns an async generator that yields ChatStreamEvents
 */
export const sendChatMessageStream = (payload: {
  message: string;
  conversation_id: string | null;
  resource_context?: ResourceContext;
  aiConfig?: AIConfig;
  agent_type?: AgentType;
}) => {
  return async function* (ctx: AgentContext): AsyncGenerator<ChatStreamEvent> {
    const conversationId = payload.conversation_id ?? uuid();
    const messageId = uuid();

    // Build context-enhanced message
    const enhancedMessage = payload.resource_context
      ? `${payload.message}

[Context: User is currently ${payload.resource_context.action ?? "viewing"} ${payload.resource_context.resource}${payload.resource_context.recordId ? ` with ID ${payload.resource_context.recordId}` : ""}]`
      : payload.message;

    try {
      // Get or create agent with optional type + provider override
      const agentResult = await getOrCreateAgent(
        payload.agent_type,
        payload.aiConfig,
      )(ctx)();

      if (agentResult._tag === "Left") {
        // Error case
        yield {
          type: "error",
          timestamp: new Date().toISOString(),
          error: "Failed to create agent with requested provider",
        } satisfies ChatStreamEvent;
        return;
      }

      const agent = agentResult.right;

      // Signal message start with provider info
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
      } satisfies ChatStreamEvent;

      // Stream the agent's response
      const streamResult = await agent.stream(
        {
          messages: [enhancedMessage],
        },
        {
          streamMode: ["messages", "updates", "debug"],
          configurable: { thread_id: conversationId },
          recursionLimit: 50,
        },
      );

      let contentAccumulator = "";
      // Map of tool_call_id → accumulated {name, args} across streaming chunks.
      // tool_call_start is deferred until the ToolMessage arrives so we emit
      // the complete args rather than an empty {} from the first partial chunk.
      const pendingToolCalls = new Map<
        string,
        { name: string; args: string }
      >();
      const processedToolCalls = new Set<string>();

      // Track <think> tag state for Qwen3 models that emit thinking
      // content inline as <think>...</think> in delta.content
      let insideThinkBlock = false;
      let thinkBuffer = "";

      for await (const [streamMode, chunk] of streamResult) {
        ctx.logger.debug.log("Stream chunk [%s]: %O", streamMode, chunk);

        if (streamMode === "messages") {
          // In LangGraph messages mode, chunk is [messageChunk, metadata].
          // Destructure properly to avoid iterating the metadata object as a message.
          const [msg, metadata] = (
            Array.isArray(chunk) ? chunk : [chunk, {}]
          ) as [AIMessage, { langgraph_node?: string }];

          // ToolMessages carry tool results. Emit tool_call_start (with the final
          // accumulated args) then tool_call_end. Deferring tool_call_start until
          // here ensures the UI shows the complete args instead of {}.
          if ("tool_call_id" in msg && msg.tool_call_id) {
            const toolCallId = msg.tool_call_id as string;
            const pending = pendingToolCalls.get(toolCallId);
            const name = pending?.name ?? msg.name ?? "";

            if (name && !processedToolCalls.has(toolCallId)) {
              processedToolCalls.add(toolCallId);
              yield {
                type: "tool_call_start",
                timestamp: new Date().toISOString(),
                tool_call: {
                  id: toolCallId,
                  name,
                  arguments: pending?.args ?? "",
                },
              } satisfies ChatStreamEvent;
            }

            if (name) {
              yield {
                type: "tool_call_end",
                timestamp: new Date().toISOString(),
                tool_call: {
                  id: toolCallId,
                  name,
                  result:
                    typeof msg.content === "string"
                      ? msg.content
                      : JSON.stringify(msg.content),
                },
              } satisfies ChatStreamEvent;
            }

            // Reset content accumulator after each tool execution so only the
            // content generated AFTER the last tool call ends up in the final
            // stored message (preamble text before tool calls is discarded).
            contentAccumulator = "";
            insideThinkBlock = false;
            thinkBuffer = "";
            continue;
          }

          // Handle reasoning from additional_kwargs (LocalAI/Qwen3 thinking mode via
          // ChatOpenAICompletionsWithThinking — delta.reasoning lands here instead of content).
          // Must happen BEFORE the supervisor skip so thinking is always visible.
          const reasoning = msg.additional_kwargs?.reasoning;
          if (typeof reasoning === "string" && reasoning) {
            yield {
              type: "content_delta",
              timestamp: new Date().toISOString(),
              content: reasoning,
              message_id: messageId,
              thinking: true,
            } satisfies ChatStreamEvent;
          }

          // In auto (multi-agent) mode the supervisor emits a one-word routing
          // decision ("platform" / "researcher"). Always skip its content so the
          // routing word never leaks into the chat bubble. Reasoning was already
          // emitted just above.
          if (metadata?.langgraph_node === "supervisor") {
            continue;
          }

          // Accumulate tool call args across streaming chunks.
          // tool_call_start is deferred to ToolMessage time (above) so we always
          // show complete args instead of the empty {} from the first chunk.
          if (msg.tool_calls && msg.tool_calls.length > 0) {
            for (const toolCall of msg.tool_calls) {
              const toolCallId = toolCall.id ?? uuid();
              const args =
                typeof toolCall.args === "string"
                  ? toolCall.args
                  : JSON.stringify(toolCall.args);
              pendingToolCalls.set(toolCallId, {
                name:
                  toolCall.name ?? pendingToolCalls.get(toolCallId)?.name ?? "",
                args,
              });
            }
          }

          // Handle content deltas — parse <think> tags for Qwen3/LocalAI
          // msg.content in LangGraph messages mode is a delta, not the full accumulated text.
          // Skip if content is just the reasoning wrapped in <think> by
          // ChatOpenAICompletionsWithThinking (copied when delta.content was empty
          // so LangGraph doesn't stall). The <think> tag parser below handles it
          // correctly — no need for a separate echo-detection check.
          if (typeof msg.content === "string" && msg.content) {
            const newContent = msg.content;
            contentAccumulator += newContent;

            // Process the new content, splitting on <think>/</think> boundaries
            // Prepend any buffered partial tag from the previous chunk
            let remaining = thinkBuffer + newContent;
            thinkBuffer = "";
            while (remaining.length > 0) {
              if (insideThinkBlock) {
                // Look for closing </think> tag
                const closeIdx = remaining.indexOf("</think>");
                if (closeIdx !== -1) {
                  // Emit thinking content before the closing tag
                  const thinkContent = remaining.slice(0, closeIdx);
                  insideThinkBlock = false;
                  if (thinkContent) {
                    yield {
                      type: "content_delta",
                      timestamp: new Date().toISOString(),
                      content: thinkContent,
                      message_id: messageId,
                      thinking: true,
                    } satisfies ChatStreamEvent;
                  }
                  remaining = remaining.slice(closeIdx + "</think>".length);
                } else {
                  // Still inside think block, buffer the content
                  thinkBuffer += remaining;
                  remaining = "";
                }
              } else {
                // Look for opening <think> tag
                const openIdx = remaining.indexOf("<think>");
                if (openIdx !== -1) {
                  // Emit regular content before the opening tag
                  const regularContent = remaining.slice(0, openIdx);
                  if (regularContent) {
                    yield {
                      type: "content_delta",
                      timestamp: new Date().toISOString(),
                      content: regularContent,
                      message_id: messageId,
                    } satisfies ChatStreamEvent;
                  }
                  insideThinkBlock = true;
                  thinkBuffer = "";
                  remaining = remaining.slice(openIdx + "<think>".length);
                } else {
                  // No think tag — check for partial tag at end of chunk
                  const partialMatch = getPartialTagMatch(remaining);
                  if (partialMatch > 0) {
                    const safeContent = remaining.slice(
                      0,
                      remaining.length - partialMatch,
                    );
                    if (safeContent) {
                      yield {
                        type: "content_delta",
                        timestamp: new Date().toISOString(),
                        content: safeContent,
                        message_id: messageId,
                      } satisfies ChatStreamEvent;
                    }
                    thinkBuffer = remaining.slice(
                      remaining.length - partialMatch,
                    );
                  } else {
                    // Regular content, no think tags
                    yield {
                      type: "content_delta",
                      timestamp: new Date().toISOString(),
                      content: remaining,
                      message_id: messageId,
                    } satisfies ChatStreamEvent;
                  }
                  remaining = "";
                }
              }
            }
          }
        } else if (streamMode === "updates") {
          // Handle tool execution results
          if ("tools" in chunk && chunk.tools?.messages) {
            const toolMessages = chunk.tools.messages as AIMessage[];

            for (const toolMsg of toolMessages) {
              if (toolMsg.name) {
                yield {
                  type: "tool_call_end",
                  timestamp: new Date().toISOString(),
                  tool_call: {
                    id: uuid(),
                    name: toolMsg.name,
                    result:
                      typeof toolMsg.content === "string"
                        ? toolMsg.content
                        : JSON.stringify(toolMsg.content),
                  },
                } satisfies ChatStreamEvent;
              }
            }
          }
        } else if (streamMode === "debug") {
          // Handle debug/think messages from LLM (e.g., OpenAI's extended thinking)
          if (
            "type" in chunk &&
            chunk.type === "checkpoint" &&
            "values" in chunk
          ) {
            const values = chunk.values as {
              messages?: AIMessage[];
            };
            if (values.messages && Array.isArray(values.messages)) {
              for (const msg of values.messages) {
                // Check for thinking/debug content in additional kwargs
                const additionalKwargs = msg.additional_kwargs || {};
                if ("thinking" in additionalKwargs) {
                  const thinkContent = additionalKwargs.thinking;
                  if (typeof thinkContent === "string" && thinkContent) {
                    yield {
                      type: "content_delta",
                      timestamp: new Date().toISOString(),
                      content: thinkContent,
                      message_id: messageId,
                      // Mark as thinking content
                      thinking: true,
                    } satisfies ChatStreamEvent;
                  }
                }
              }
            }
          }
        }
      }

      // Store messages in conversation
      const userMessage: ChatMessage = {
        id: uuid(),
        content: payload.message,
        role: "user",
        timestamp: new Date().toISOString(),
      };

      // Strip any <think> tags from the final stored content
      const finalContent =
        stripThinkTags(contentAccumulator) || "No response generated";

      const assistantMessage: ChatMessage = {
        id: messageId,
        content: finalContent,
        role: "assistant",
        timestamp: new Date().toISOString(),
      };

      const existingMessages = conversations.get(conversationId) ?? [];
      conversations.set(conversationId, [
        ...existingMessages,
        userMessage,
        assistantMessage,
      ]);

      // Signal message end
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
      } satisfies ChatStreamEvent;
    } catch (error) {
      ctx.logger.error.log("Stream error: %O", error);
      yield {
        type: "error",
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : "Unknown streaming error",
      } satisfies ChatStreamEvent;
    }
  };
};
