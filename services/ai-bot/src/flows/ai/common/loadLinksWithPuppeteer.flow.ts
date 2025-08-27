import { type Document } from "@langchain/core/documents";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { toAIBotError } from "../../../common/error/index.js";
import { VanillaPuppeteerLoader } from "../../../common/langchain/VanillaPuppeteerWebLoader.js";
import { type ClientContext } from "../../../context.js";
import { type ClientContextRTE } from "../../../types.js";

export const loadLinksWithPuppeteer = (
  urls: URL[],
): ClientContextRTE<readonly Document[][]> => {
  return pipe(
    fp.RTE.ask<ClientContext>(),
    fp.RTE.chainTaskEitherK((ctx) =>
      fp.TE.bracket(
        pipe(ctx.puppeteer.getBrowser({}), fp.TE.mapLeft(toAIBotError)),
        (browser) =>
          pipe(
            urls,
            fp.A.traverse(fp.TE.ApplicativeSeq)((url) => {
              return pipe(
                fp.TE.tryCatch(
                  () => new VanillaPuppeteerLoader(url, browser).load(),
                  toAIBotError,
                ),
                fp.T.map((result) => {
                  // ignore errors
                  if (fp.E.isLeft(result)) {
                    return fp.E.right([]);
                  }
                  return result;
                }),
              );
            }),
          ),
        (browser, result) =>
          pipe(
            fp.TE.tryCatch(() => browser.close(), toAIBotError),
            fp.TE.chainIOEitherK(() => () => {
              if (fp.E.isLeft(result)) {
                return result;
              }
              return fp.E.right(undefined);
            }),
          ),
      ),
    ),
  );
};
