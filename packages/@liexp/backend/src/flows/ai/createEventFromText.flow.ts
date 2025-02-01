import { type Document } from "@langchain/core/documents";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import {
  type EventType,
  type Event,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { type CreateEventBody } from "@liexp/shared/lib/io/http/Events/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type DBError } from "../../providers/orm/database.provider.js";

export const createEventFromText =
  <C extends LoggerContext & LangchainContext>(
    text: Document[],
    question: string,
    type: EventType,
    promptTemplate: string,
    jsonSchema: string,
  ): ReaderTaskEither<C, APIError | DBError, Event> =>
  (ctx) => {
    return pipe(
      fp.TE.tryCatch(async () => {
        const prompt = await PromptTemplate.fromTemplate(
          promptTemplate,
        ).partial({
          evenType: type,
          jsonSchema,
        });

        const parser = new JsonOutputParser<CreateEventBody>();

        const ragChain = RunnableSequence.from([
          {
            question: new RunnablePassthrough(),
          },
          prompt,
          ctx.langchain.chat,
          parser,
        ]);

        const stream = await ragChain.stream(question);

        let output;
        for await (const chunk of stream) {
          // console.log('streaming', chunk.text);
          output = chunk;
        }
        ctx.logger.info.log("output %O", output);

        return output as Event;
      }, toAPIError),
    );
  };
