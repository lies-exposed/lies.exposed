import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { toAIBotError } from "../common/error/index.js";
import { type CommandFlow } from "./CommandFlow.js";

export const chatCommand: CommandFlow = async (ctx, args) => {
  return pipe(
    fp.TE.tryCatch(async () => {
      const result = await ctx.langchain.chat
        .withConfig({
          reasoning: {
            effort: "minimal",
          },
        })
        .invoke([
          {
            role: "system",
            content:
              "You are a helpful assistant that translates answer to the given message.",
          },
          {
            role: "user",
            content: args[0],
          },
        ]);

      ctx.logger.info.log(`Message: %O`, result.toJSON());
    }, toAIBotError),
    throwTE,
  );
};
