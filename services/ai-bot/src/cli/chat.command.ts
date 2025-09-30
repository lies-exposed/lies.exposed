import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { toAIBotError } from "../common/error/index.js";
import { type CommandFlow } from "./CommandFlow.js";

export const chatCommand: CommandFlow = async (ctx, args) => {
  return pipe(
    fp.TE.tryCatch(async () => {
      const stream = await ctx.langchain.chat
        .withConfig({
          reasoning: {
            effort: "minimal",
          },
          tools: ctx.agent.tools,
        })
        .stream([
          {
            role: "system",
            content:
              "You are a helpful assistant that answers the given question.",
          },
          {
            role: "user",
            content: args[0],
          },
        ]);

      let result = "";
      for await (const chunk of stream) {
        result += chunk.content as string;
      }

      ctx.logger.info.log(`Message: %O`, result);
    }, toAIBotError),
    throwTE,
  );
};
