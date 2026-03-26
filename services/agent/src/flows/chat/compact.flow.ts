import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { HumanMessage, SystemMessage } from "langchain";
import { type AgentContext } from "../../context/context.type.js";

export const compactConversation =
  (conversationId: string) =>
  (
    ctx: AgentContext,
  ): TE.TaskEither<
    ServerError,
    { newConversationId: string; summary: string }
  > => {
    return TE.tryCatch(async () => {
      // Get current conversation state from LangGraph checkpointer
      const graph = ctx.agent.agent as any;
      const state = await graph.getState({
        configurable: { thread_id: conversationId },
      });

      const messages: any[] = state?.values?.messages ?? [];

      if (messages.length === 0) {
        throw new Error("No messages to compact");
      }

      // Build text representation, skipping tool messages and stripping think tags
      const conversationText = messages
        .filter((m: any) => {
          const type = m._getType?.() ?? m.getType?.();
          return type !== "tool";
        })
        .map((m: any) => {
          const type = m._getType?.() ?? m.getType?.() ?? "unknown";
          const rawContent =
            typeof m.content === "string"
              ? m.content
              : JSON.stringify(m.content);
          // Strip <think> blocks from the text
          const content = rawContent
            .replace(/<think>[\s\S]*?<\/think>/g, "")
            .trim()
            .substring(0, 800);
          return `${type}: ${content}`;
        })
        .join("\n\n");

      ctx.logger.info.log(
        "Compacting conversation %s (%d messages)",
        conversationId,
        messages.length,
      );

      // Summarize using the current LLM
      const summaryResponse = await ctx.langchain.chat.invoke([
        new SystemMessage(
          "You are a conversation summarizer. Create a concise summary of the following conversation that captures the key context, decisions made, and important information discussed. The summary will be used as context to continue the conversation in a new thread. Be thorough but concise — aim for 3-8 sentences.",
        ),
        new HumanMessage(
          `Please summarize this conversation:\n\n${conversationText}`,
        ),
      ]);

      const summary =
        typeof summaryResponse.content === "string"
          ? summaryResponse.content
          : JSON.stringify(summaryResponse.content);

      // Create a new conversation ID
      const newConversationId = uuid();

      // Seed the new thread with the summary as system context
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
    }, ServerError.fromUnknown);
  };
