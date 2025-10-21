import {
  type BaseMessage,
  type BaseMessageLike,
} from "@langchain/core/dist/messages/base.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ReactAgent } from "langchain";
import type { LangchainContext } from "../../context/langchain.context.js";
import type { LoggerContext } from "../../context/logger.context.js";

const runRunnableSequence =
  <
    C extends LangchainContext & LoggerContext = LangchainContext &
      LoggerContext,
  >(
    inputs: Array<BaseMessage | BaseMessageLike>,
    chain: ReactAgent,
    mode: "stream" | "invoke" = "stream",
  ): ReaderTaskEither<C, APIError, any> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      ctx.logger.debug.log("Running sequence in mode %s", mode);

      let output = "";
      if (mode === "stream") {
        const stream = await chain.stream(inputs);

        for await (const chunk of stream) {
          output += chunk;
        }
      } else {
        output = await chain.invoke(inputs);
      }

      ctx.logger.debug.log("Output %s", output);

      return output;
    }, toAPIError);
  };

export const runAgent = <
  R = string,
  C extends LangchainContext & LoggerContext = LangchainContext & LoggerContext,
>(
  inputs: Array<BaseMessage | BaseMessageLike>,
  chain: ReactAgent,
  mode: "stream" | "invoke" = "stream",
): ReaderTaskEither<C, APIError, R> => {
  return runRunnableSequence(inputs, chain, mode);
};
