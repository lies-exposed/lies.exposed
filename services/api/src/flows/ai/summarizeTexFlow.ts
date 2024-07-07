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

export const summarizeTextFlow = (
  langchain: LangchainProvider,
  docs: LangchainDocument[],
): TaskEither<ControllerError, string> => {
  return fp.TE.tryCatch(async () => {
    return langchain.summarizeText(docs);
  }, toControllerError);
};
