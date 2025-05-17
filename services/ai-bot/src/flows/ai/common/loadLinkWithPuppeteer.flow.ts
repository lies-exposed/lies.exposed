import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type Document } from "langchain/document";
import { toAIBotError } from "../../../common/error/index.js";
import { VanillaPuppeteerLoader } from "../../../common/langchain/VanillaPuppeteerWebLoader.js";
import { type ClientContext } from "../../../context.js";
import { type ClientContextRTE } from "../../../types.js";

export const loadLinkWithPuppeteer = (
  url: URL,
): ClientContextRTE<Document[]> => {
  return pipe(
    fp.RTE.ask<ClientContext>(),
    LoggerService.RTE.debug(["Loading link from URL %s", url]),
    fp.RTE.chainTaskEitherK((ctx) =>
      fp.TE.bracket(
        ctx.puppeteer.getBrowser({}),
        (browser) =>
          fp.TE.tryCatch(
            () => new VanillaPuppeteerLoader(url, browser).load(),
            toAIBotError,
          ),
        (browser) => fp.TE.tryCatch(() => browser.close(), toAIBotError),
      ),
    ),
  );
};
