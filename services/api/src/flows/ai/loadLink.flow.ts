import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const loadLink: TEFlow<[string], Document[]> = (ctx) => (url) => {
  ctx.logger.debug.log("Querying link from URL %s", url);
  return pipe(
    fp.TE.tryCatch(async () => {
      const loader = new CheerioWebBaseLoader(url, {
        selector: "h1,h2,h3,h4,h5,h6,p,article",
      });
      return loader.load();
    }, toControllerError),
  );
};
