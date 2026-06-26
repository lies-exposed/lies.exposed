import { type BaseMessage } from "@langchain/core/messages";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { SystemMessage } from "langchain";
import { type AgentContext } from "../../context/context.type.js";

/**
 * Minimal view of the compiled LangGraph the factory caches: it owns the
 * checkpointer, so we read/seed thread state through these two methods instead
 * of casting to `any`.
 */
interface CheckpointedGraph {
  getState(config: {
    configurable: { thread_id: string };
  }): Promise<{ values?: { messages?: BaseMessage[] } }>;
  updateState(
    config: { configurable: { thread_id: string } },
    values: { messages: BaseMessage[] },
  ): Promise<unknown>;
}

const messageToText = (m: BaseMessage): string => {
  const content =
    typeof m.content === "string" ? m.content : JSON.stringify(m.content);
  // Strip <think> blocks and cap length to keep the summary prompt bounded.
  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim()
    .substring(0, 800);
  return `${m.getType()}: ${cleaned}`;
};

export const compactConversation =
  (conversationId: string) =>
  (
    ctx: AgentContext,
  ): TE.TaskEither<
    ServerError,
    { newConversationId: string; summary: string }
  > => {
    return pipe(
      // Resolve the default "auto" agent (cached, owns the shared checkpointer).
      ctx.agentFactory("auto"),
      TE.chain((agent) =>
        TE.tryCatch(async () => {
          const graph = agent as unknown as CheckpointedGraph;
          const state = await graph.getState({
            configurable: { thread_id: conversationId },
          });

          const messages = state.values?.messages ?? [];
          if (messages.length === 0) {
            throw new Error("No messages to compact");
          }

          const conversationText = messages
            .filter((m) => m.getType() !== "tool")
            .map(messageToText)
            .join("\n\n");

          ctx.logger.info.log(
            "Compacting conversation %s (%d messages)",
            conversationId,
            messages.length,
          );

          // Summarize using the current LLM.
          const summaryResponse = await ctx.langchain.chat.invoke([
            new SystemMessage(
              "You are a conversation summarizer. Create a concise summary of the following conversation that captures the key context, decisions made, and important information discussed. The summary will be used as context to continue the conversation in a new thread. Be thorough but concise — aim for 3-8 sentences.",
            ),
            `Please summarize this conversation:\n\n${conversationText}`,
          ]);

          const summary =
            typeof summaryResponse.content === "string"
              ? summaryResponse.content
              : JSON.stringify(summaryResponse.content);

          // Seed a fresh thread with the summary as system context.
          const newConversationId = uuid();
          await graph.updateState(
            { configurable: { thread_id: newConversationId } },
            {
              messages: [
                new SystemMessage(
                  `This is a continuation of a previous conversation. Here is a summary of the prior context:\n\n${summary}`,
                ),
              ],
            },
          );

          ctx.logger.info.log(
            "Conversation compacted: %s → %s",
            conversationId,
            newConversationId,
          );

          return { newConversationId, summary };
        }, ServerError.fromUnknown),
      ),
    );
  };
