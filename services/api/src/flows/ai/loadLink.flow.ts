import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const loadLink = (url: string): TEReader<Document[]> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK((ctx) =>
      fp.TE.tryCatch(async () => {
        ctx.logger.debug.log("Querying link from URL %s", url);
        const loader = new CheerioWebBaseLoader(url, {
          selector: "h1,h2,h3,h4,h5,h6,p,article",
        });
        return loader.load();
      }, toControllerError),
    ),
  );
};
