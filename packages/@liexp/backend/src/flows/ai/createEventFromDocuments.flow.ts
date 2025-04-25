import { type Document } from "@langchain/core/documents";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EventCommonProps } from "@liexp/shared/lib/helpers/event/getCommonProps.helper.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { type JSONSchema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { getCreateEventPromptPartial } from "./createEventFromText.flow.js";
import { runRagChain } from "./runRagChain.js";

export const createEventFromDocuments = <
  C extends LangchainContext & LoggerContext,
>(
  documents: Document[],
  type: EventType,
  prompt: PromptFn<{
    type: EventType;
    jsonSchema: string;
    question: string;
    context: string;
  }>,
  jsonSchema: JSONSchema.JsonSchema7,
  question: string | null,
): ReaderTaskEither<C, APIError, EventCommonProps> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => getCreateEventPromptPartial<C>(prompt, type)),
    fp.RTE.bind("retriever", () => (ctx) => {
      return pipe(
        fp.TE.tryCatch(async () => {
          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 1000,
          });
          const splits = await textSplitter.splitDocuments(documents);

          const vectorStore = await MemoryVectorStore.fromDocuments(
            splits,
            ctx.langchain.embeddings,
          );

          ctx.logger.debug.log("Vector store generated");

          // Retrieve and generate using the relevant snippets of the blog.
          const retriever = vectorStore.asRetriever({ verbose: true });
          return retriever;
        }, toAPIError),
      );
    }),
    fp.RTE.bind(
      "model",
      () => (ctx) =>
        fp.TE.right(
          ctx.langchain.chat.bind({
            response_format: {
              type: "json_object",
            },
          }),
        ),
    ),
    fp.RTE.chain(({ prompt, retriever, model }) => {
      const parser = new JsonOutputParser<EventCommonProps>();

      return runRagChain<EventCommonProps, C>(
        {
          context: retriever.pipe(formatDocumentsAsString),
        },
        prompt.pipe(model).pipe(parser),
        question,
      );
    }),
  );
};
