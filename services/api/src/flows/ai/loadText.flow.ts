import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const loadText = (text: string): TEReader<Document[]> => {
  return pipe(
    LoggerService.debug(() => [
      "Loading text in documents %s",
      text.substring(0, 30).concat("..."),
    ]),
    fp.RTE.fromReader,
    fp.RTE.chainTaskEitherK(() =>
      pipe(
        fp.TE.tryCatch(async () => {
          const loader = new TextLoader(new Blob([text]));
          const docs = await loader.load();
          return docs;
        }, toControllerError),
      ),
    ),
  );
};
