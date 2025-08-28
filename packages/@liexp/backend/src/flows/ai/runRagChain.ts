import {
  RunnablePassthrough,
  RunnableSequence,
  type RunnableLike,
} from "@langchain/core/runnables";
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
    question: string,
  ): ReaderTaskEither<C, APIError, R> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      // Set up a parser + inject instructions into the prompt template.

      const ragChain = RunnableSequence.from<string>([
        { ...inputs, question: new RunnablePassthrough() },
        chain,
      ]);

      const output = await ragChain.invoke(question);

      ctx.logger.debug.log("RAG chain output %O", output);

      return output;
    }, toAPIError);
  };

export const runRagChainStream =
  <
    C extends LangchainContext & LoggerContext = LangchainContext &
      LoggerContext,
  >(
    inputs: RunnableLike,
    chain: RunnableLike,
    question: string,
  ): ReaderTaskEither<C, APIError, string> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      const ragChain = RunnableSequence.from([
        { ...inputs, question: new RunnablePassthrough() },
        chain,
      ]);

      const stream = await ragChain.stream(question);

      let output = "";
      for await (const chunk of stream) {
        output += chunk;
      }

      ctx.logger.debug.log("RAG chain stream output %O", output);

      return output;
    }, toAPIError);
  };
