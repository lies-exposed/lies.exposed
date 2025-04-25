import { RunnableSequence, type RunnableLike } from "@langchain/core/runnables";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type { LangchainContext } from "../../context/langchain.context.js";
import type { LoggerContext } from "../../context/logger.context.js";

export const runRagChain =
  <C extends LangchainContext & LoggerContext>(
    inputs: RunnableLike<any>,
    chain: RunnableLike<any>,
    question: string | null,
  ): ReaderTaskEither<C, APIError, Event> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      // Set up a parser + inject instructions into the prompt template.
      // const parser = new JsonOutputParser<Event>();

      const ragChain = RunnableSequence.from([inputs, chain]);

      const stream = await ragChain.invoke(question);

      let output: any;
      for await (const chunk of stream) {
        output = chunk;
        ctx.logger.debug.log("Add chunk to output total %d", output.length);
      }

      ctx.logger.info.log("output", output);

      return output;
    }, toAPIError);
  };
