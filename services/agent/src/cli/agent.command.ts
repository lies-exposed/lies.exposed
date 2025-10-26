import { type AIMessage } from "@langchain/core/messages";
import { AIMessageLogger } from "@liexp/backend/lib/providers/ai/aiMessage.helper.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import prompts from "prompts";
import { type AgentContext } from "#context/context.type.js";
import * as TE from "fp-ts/lib/TaskEither.js";

export class AgentCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentCommandError";
  }
}

const toAgentCommandError = (e: unknown): AgentCommandError => {
  return new AgentCommandError(
    e instanceof Error ? e.message : "Unknown agent command error"
  );
};

export const agentCommand = async (ctx: AgentContext, _args: string[]) => {
  const threadId = uuid();
  const agent = ctx.agent.agent.withConfig({
    configurable: {
      thread_id: threadId,
    },
  });

  const aiMessageLogger = AIMessageLogger(ctx.logger);

  const ask = async (ag: typeof agent, message: string) => {
    const agentFinalState = await ag.stream(
      {
        messages: [message],
      },
      { streamMode: ["debug", "messages", "updates", "tasks", "values"] },
    );

    try {
      let answer = "";
      for await (const [streamMode, chunk] of agentFinalState) {
        ctx.logger.debug.log("Agent stream:", streamMode, chunk);
        const messages = (
          "agent" in chunk ? chunk.agent.messages : []
        ) as AIMessage[];
        const toolMessages = (
          "tools" in chunk ? chunk.tools.messages : []
        ) as AIMessage[];

        [...messages, ...toolMessages].forEach(aiMessageLogger);

        if ("agent" in chunk) {
          answer += chunk.agent.messages.map((m: any) => m.content).join("\n");
        }
      }
      return answer;
    } catch (error) {
      ctx.logger.error.log("Error processing agent stream:", error);
      throw error;
    }
  };

  const chat = async (ag: typeof agent) => {
    const { question } = await prompts({
      message: 'Enter a command (type "exit" to quit):',
      type: "text",
      name: "question",
    });

    if (!question || question.toLowerCase() === "exit") {
      ctx.logger.info.log("Goodbye!");
      return;
    } else {
      const result = await ask(ag, question);

      ctx.logger.debug.log("Answer %O", result);

      await chat(ag);
    }
  };

  return pipe(
    TE.tryCatch(async () => {
      // Init the chat loop!
      await chat(agent);
    }, toAgentCommandError),
    throwTE,
  );
};