import { getPlatform, VideoPlatformMatch } from "@liexp/shared/helpers/media";
import { toPuppeteerError } from "@liexp/shared/providers/puppeteer.provider";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Page } from "puppeteer-core";
import { ControllerError, ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const extractThumbnail = (
  match: VideoPlatformMatch,
  page: Page
): TE.TaskEither<Error, string> => {
  const toError = (m: VideoPlatformMatch): Error => {
    return new Error(`Can't find cover for platform '${m.platform}'`);
  };

  return pipe(
    TE.tryCatch(async () => {
      switch (match.platform) {
        case "bitchute": {
          await page.waitForSelector(".plyr__poster");

          return await page.$eval(".plyr__poster", (el) => {
            const style = el.getAttribute("style");

            const coverUrl = style
              ?.replace('background-image: url("', "")
              .replace(';")', "");

            return coverUrl;
          });
        }
        case "youtube": {
          const selector = ".ytp-cued-thumbnail-overlay-image";
          await page.waitForSelector(selector);

          return await page.$eval(selector, (el) => {
            const style = el.getAttribute("style");

            const coverUrl = style
              ?.replace('background-image: url("', "")
              .replace('")', "");

            return coverUrl;
          });
        }
        case "odysee": {
          const selector = ".vjs-poster";
          await page.waitForSelector(selector);

          return await page.$eval(selector, (el) => {
            const style = el.getAttribute("style");

            const coverUrl = style
              ?.replace('background-image: url("', "")
              .replace('")', "");

            return coverUrl;
          });
        }
        case "rumble": {
          const selector = "video";
          await page.waitForSelector(selector);

          return await page.$eval(selector, (el) => {
            return el.getAttribute("poster");
          });
        }
        default: {
          return undefined;
        }
      }
    }, E.toError),
    TE.chain((thumb) => {
      if (!thumb) {
        return TE.left(toError(match));
      }
      return TE.right(thumb);
    })
  );
};

export const createThumbnail =
  (ctx: RouteContext) =>
  (location: string): TE.TaskEither<ControllerError, string> => {
    ctx.logger.debug.log("Extracting thumbnail from url %s", location);
    return pipe(
      sequenceS(TE.ApplyPar)({
        html: pipe(
          ctx.puppeteer.getBrowser(location, {}),
          TE.chain((b) => {
            return TE.tryCatch(async () => {
              const page = await b.pages().then((p) => p[0]);
              await page.goto(location, { waitUntil: "networkidle0" });

              return page;
            }, toPuppeteerError);
          }),
          TE.mapLeft((e) => ServerError(e as any))
        ),
        match: pipe(
          getPlatform(location),
          E.mapLeft((e) => ServerError(e as any)),
          TE.fromEither
        ),
      }),
      TE.chain(({ html, match }) => {
        return pipe(
          extractThumbnail(match, html),
          TE.mapLeft((e) => ServerError(e as any)),
          TE.map((url) => url),
          TE.chainFirst(() =>
            TE.tryCatch(
              () => html.browser().close(),
              (e) => ServerError(e as any)
            )
          )
        );
      })
    );
  };
