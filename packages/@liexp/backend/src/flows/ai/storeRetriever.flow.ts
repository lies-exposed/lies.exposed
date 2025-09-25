import { type Document } from "@langchain/core/documents";
import { type VectorStoreRetriever } from "@langchain/core/vectorstores";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";

export const getStoreRetriever =
  <C extends LangchainContext & LoggerContext>(
    documents: Document[],
  ): ReaderTaskEither<C, APIError, VectorStoreRetriever<MemoryVectorStore>> =>
  (ctx) => {
    return pipe(
      fp.TE.tryCatch(async () => {
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 2000,
          chunkOverlap: 1000,
        });
        const splits = await textSplitter.splitDocuments(documents);

        ctx.logger.debug.log(
          `Split documents into %d sub-documents.`,
          splits.length,
        );

        const vectorStore = await MemoryVectorStore.fromDocuments(
          splits,
          ctx.langchain.embeddings,
        );

        ctx.logger.debug.log(
          "Vector store generated from documents %d",
          documents.length,
        );

        return vectorStore.asRetriever({ verbose: true });
      }, toAPIError),
    );
  };
