import {
  type LangchainDocument,
  type LangchainProvider,
} from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type AIBotError, toAIBotError } from "../../common/error/index.js";

export const embedAndQuestionFlow = (
  langchain: LangchainProvider,
  docs: LangchainDocument[],
  question: string,
): TaskEither<AIBotError, string> => {
  return fp.TE.tryCatch(async () => {
    return langchain.queryDocument(docs, question);
  }, toAIBotError);
};
