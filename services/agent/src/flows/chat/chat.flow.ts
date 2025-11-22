import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type ChatResponse,
  type ChatMessage,
  type ResourceContext,
  type ChatStreamEvent,
} from "@liexp/shared/lib/io/http/Chat.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AIMessage } from "langchain";
import { type AgentContext } from "../../context/context.type.js";

// In-memory storage for conversations (in production, use a database)
const conversations = new Map<string, ChatMessage[]>();

export const sendChatMessage =
  (payload: {
    message: string;
    conversation_id: string | null;
    resource_context?: ResourceContext;
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
      ctx.agent.invoke(
        {
          messages: [enhancedMessage],
        },
        { configurable: { thread_id: conversationId } },
      ),
      TE.mapLeft((error) => ServerError.fromUnknown(error)),
      TE.map((result) => {
        // Extract the message content from the agent result
        const lastMessage = result.messages[result.messages.length - 1];
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
        };
      }),
    );
  };

export const getChatConversation =
  (conversationId: string) =>
  (_ctx: AgentContext): TE.TaskEither<Error, ChatMessage[]> => {
    return pipe(TE.right(conversations.get(conversationId) ?? []));
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
    return pipe(
      TE.right({
        total: conversations.size,
        data: Array.from(conversations.entries()).map(([id, messages]) => ({
          id,
          messages,
          created_at: messages[0]?.timestamp ?? new Date().toISOString(),
          updated_at:
            messages[messages.length - 1]?.timestamp ??
            new Date().toISOString(),
        })),
      }),
    );
  };

export const deleteChatConversation =
  (conversationId: string) =>
  (_ctx: AgentContext): TE.TaskEither<Error, boolean> => {
    return pipe(TE.right(conversations.delete(conversationId)));
  };

/**
 * Stream chat messages with tool calls and responses
 * Returns an async generator that yields ChatStreamEvents
 */
export const sendChatMessageStream = (payload: {
  message: string;
  conversation_id: string | null;
  resource_context?: ResourceContext;
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
      // Signal message start
      yield {
        type: "message_start",
        timestamp: new Date().toISOString(),
        message_id: messageId,
        role: "assistant",
      } satisfies ChatStreamEvent;

      // Stream the agent's response
      const streamResult = await ctx.agent.agent.stream(
        {
          messages: [enhancedMessage],
        },
        {
          streamMode: ["messages", "updates", "debug"],
          configurable: { thread_id: conversationId },
        },
      );

      let contentAccumulator = "";
      const processedToolCalls = new Set<string>();

      for await (const [streamMode, chunk] of streamResult) {
        ctx.logger.debug.log("Stream chunk [%s]: %O", streamMode, chunk);

        if (streamMode === "messages") {
          // Handle message chunks (incremental content)
          const messages = Array.isArray(chunk) ? chunk : [chunk];

          for (const msg of messages as AIMessage[]) {
            // Handle tool calls
            if (msg.tool_calls && msg.tool_calls.length > 0) {
              for (const toolCall of msg.tool_calls) {
                const toolCallId = toolCall.id ?? uuid();

                if (!processedToolCalls.has(toolCallId)) {
                  processedToolCalls.add(toolCallId);

                  // Tool call start
                  yield {
                    type: "tool_call_start",
                    timestamp: new Date().toISOString(),
                    tool_call: {
                      id: toolCallId,
                      name: toolCall.name,
                      arguments:
                        typeof toolCall.args === "string"
                          ? toolCall.args
                          : JSON.stringify(toolCall.args),
                    },
                  } satisfies ChatStreamEvent;
                }
              }
            }

            // Handle content deltas
            if (typeof msg.content === "string" && msg.content) {
              const newContent = msg.content.slice(contentAccumulator.length);
              if (newContent) {
                contentAccumulator = msg.content;
                yield {
                  type: "content_delta",
                  timestamp: new Date().toISOString(),
                  content: newContent,
                  message_id: messageId,
                } satisfies ChatStreamEvent;
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
        }
      }

      // Store messages in conversation
      const userMessage: ChatMessage = {
        id: uuid(),
        content: payload.message,
        role: "user",
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: messageId,
        content: contentAccumulator || "No response generated",
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
        content: contentAccumulator,
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
