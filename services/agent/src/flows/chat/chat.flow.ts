import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type ChatResponse,
  type ChatMessage,
} from "@liexp/shared/lib/io/http/Chat.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AgentContext } from "../../context/context.type.js";

// In-memory storage for conversations (in production, use a database)
const conversations: Map<string, ChatMessage[]> = new Map();

export const sendChatMessage =
  (payload: { message: string }) =>
  (ctx: AgentContext): TE.TaskEither<ServerError, ChatResponse> => {
    return pipe(
      ctx.agent.invoke(
        {
          messages: [payload.message],
        },
        { configurable: { thread_id: "default" } },
      ),
      TE.mapLeft((error) => ServerError.fromUnknown(error)),
      TE.map((result) => {
        // Extract the message content from the agent result
        const lastMessage = result.messages[result.messages.length - 1];
        const content =
          typeof lastMessage?.content === "string"
            ? lastMessage.content
            : JSON.stringify(lastMessage?.content ?? "No response");

        return {
          message: {
            id: lastMessage.id ?? uuid(),
            content,
            role: "assistant",
            timestamp: new Date().toISOString(),
          },
          conversationId: "default",
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
      data: Array<{
        id: string;
        messages: ChatMessage[];
        created_at: string;
        updated_at: string;
      }>;
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
