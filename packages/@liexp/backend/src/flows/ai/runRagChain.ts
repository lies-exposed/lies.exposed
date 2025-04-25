import { RunnableSequence, type RunnableLike } from "@langchain/core/runnables";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type { LangchainContext } from "../../context/langchain.context.js";
import type { LoggerContext } from "../../context/logger.context.js";

export const runRagChain =
  <
    R = string,
    C extends LangchainContext & LoggerContext = LangchainContext &
      LoggerContext,
  >(
    inputs: RunnableLike<any>,
    chain: RunnableLike<any>,
    question: string | null,
  ): ReaderTaskEither<C, APIError, R> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      // Set up a parser + inject instructions into the prompt template.

      const ragChain = RunnableSequence.from([inputs, chain]);

      const output = await ragChain.invoke(question);

      ctx.logger.debug.log("RAG chain output %O", output);

      return output;
    }, toAPIError);
  };
