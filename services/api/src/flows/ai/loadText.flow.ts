import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document.js";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const loadText: TEFlow<[string], Document[]> = (ctx) => (text) => {
  ctx.logger.debug.log(
    "Loading text in documents %s",
    text.substring(0, 30).concat("..."),
  );
  return pipe(
    fp.TE.tryCatch(async () => {
      const loader = new TextLoader(new Blob([text]));
      const docs = await loader.load();
      return docs;
    }, toControllerError),
  );
};
