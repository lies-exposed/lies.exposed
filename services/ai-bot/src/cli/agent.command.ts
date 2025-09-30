import { type AIMessage, type ToolMessage } from "@langchain/core/messages";
import { AIMessageLogger } from "@liexp/backend/lib/providers/ai/aiMessage.helper.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import prompts from "prompts";
import { toAIBotError } from "../common/error/index.js";
import { type CommandFlow } from "./CommandFlow.js";

export const agentCommand: CommandFlow = async (ctx, args) => {
  const threadId = uuid();
  const agent = ctx.agent.agent.withConfig({
    configurable: {
      thread_id: threadId,
    },
  });

  const ask = async (ag: typeof agent, message: string) => {
    const agentFinalState = await ag.stream(
      {
        messages: [message],
      },
      {},
    );

    const aiMessageLogger = AIMessageLogger(ctx.logger);

    for await (const chunk of agentFinalState) {
      const messages = (chunk.agent?.messages ??
        chunk.tools?.messages ??
        []) as (ToolMessage | AIMessage)[];

      messages.forEach(aiMessageLogger);
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
    fp.TE.tryCatch(async () => {
      // Init the chat loop!
      await chat(agent);
    }, toAIBotError),
    throwTE,
  );
};
