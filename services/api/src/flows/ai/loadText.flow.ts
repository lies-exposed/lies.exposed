import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const loadText = (text: string): TEReader<Document[]> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK((ctx) =>
      fp.TE.tryCatch(async () => {
        ctx.logger.debug.log(
          "Loading text in documents %s",
          text.substring(0, 30).concat("..."),
        );
        const loader = new TextLoader(new Blob([text]));
        const docs = await loader.load();
        return docs;
      }, toControllerError),
    ),
  );
};
