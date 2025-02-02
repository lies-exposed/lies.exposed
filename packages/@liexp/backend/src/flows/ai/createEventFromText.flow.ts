import { type Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import {
  type Event,
  type EventType,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { runRagChain } from "./runRagChain.js";

export const getCreateEventPromptPartial =
  <C extends LoggerContext>(
    promptTemplate: string,
    type: EventType,
    jsonSchema: any,
  ): ReaderTaskEither<C, APIError, PromptTemplate> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      ctx.logger.info.log(
        "Populating template \n%s with even type %s \n and json schema %O",
        promptTemplate,
        type,
        jsonSchema,
      );

      const prompt = await PromptTemplate.fromTemplate(promptTemplate).partial({
        evenType: type,
        jsonSchema: JSON.stringify(jsonSchema),
      });

      return prompt;
    }, toAPIError);
  };

export const createEventFromText = <C extends LoggerContext & LangchainContext>(
  text: Document[],
  type: EventType,
  promptTemplate: string,
  jsonSchema: string,
  question: string,
): ReaderTaskEither<C, APIError | DBError, Event> => {
  return pipe(
    getCreateEventPromptPartial(promptTemplate, type, jsonSchema),
    fp.RTE.chain((prompt) =>
      runRagChain<C>(
        {
          context: () => text.flatMap((t) => t.pageContent).join("\n"),
          question: new RunnablePassthrough(),
        },
        prompt,
        question,
      ),
    ),
  );
};
