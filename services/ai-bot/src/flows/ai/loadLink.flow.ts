// cheerio
import "cheerio";
// other imports
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Document } from "langchain/document";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContext } from "../../context.js";
import { type ClientContextRTE } from "#flows/types.js";

export const loadLink = (url: string): ClientContextRTE<Document[]> => {
  return pipe(
    fp.RTE.ask<ClientContext>(),
    LoggerService.RTE.debug(["Loading link from URL %s", url]),
    fp.RTE.chainTaskEitherK(() =>
      fp.TE.tryCatch(async () => {
        const loader = new CheerioWebBaseLoader(url, {
          selector: "h1,h2,h3,h4,h5,h6,p,article",
        });
        return loader.load();
      }, toAIBotError),
    ),
  );
};
