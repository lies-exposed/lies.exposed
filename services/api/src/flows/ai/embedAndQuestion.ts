import { fp } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import {
  type LangchainDocument,
  type LangchainProvider,
} from "#providers/ai/langchain.provider.js";

export const embedAndQuestionFlow = (
  langchain: LangchainProvider,
  docs: LangchainDocument[],
  question: string,
): TaskEither<ControllerError, string> => {
  return fp.TE.tryCatch(async () => {
    return langchain.queryDocument(docs, question);
  }, toControllerError);
};
