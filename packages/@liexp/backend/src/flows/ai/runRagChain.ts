import { JsonOutputParser } from "@langchain/core/output_parsers";
import type { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, type RunnableLike } from "@langchain/core/runnables";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import type {
  CreateEventBody,
  Event,
} from "@liexp/shared/lib/io/http/Events/index.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type { LangchainContext } from "../../context/langchain.context.js";
import type { LoggerContext } from "../../context/logger.context.js";

export const runRagChain =
  <C extends LangchainContext & LoggerContext>(
    inputs: RunnableLike<any>,
    prompt: PromptTemplate,
    question: string | null,
  ): ReaderTaskEither<C, APIError, Event> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      // Set up a parser + inject instructions into the prompt template.
      const parser = new JsonOutputParser<CreateEventBody>();

      const ragChain = RunnableSequence.from([
        inputs,
        prompt.pipe(ctx.langchain.chat).pipe(parser),
      ]);

      const stream = await ragChain.stream(question);

      let output: any;
      for await (const chunk of stream) {
        ctx.logger.debug.log("chunk", chunk);
        output = chunk;
      }

      ctx.logger.info.log("output", output);

      return output;
    }, toAPIError);
  };
