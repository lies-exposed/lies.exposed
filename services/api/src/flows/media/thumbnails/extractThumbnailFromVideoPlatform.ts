import { toPuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  getPlatform,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media.helper.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Page } from "puppeteer-core";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { type ExtractThumbnailFromMediaFlow } from "./ExtractThumbnailFlow.type.js";
import { fetchFromRemote } from "./fetchFromRemote.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import {
  type ControllerError,
  toControllerError,
} from "#io/ControllerError.js";

export const extractThumbnailFromVideoPlatform =
  (match: VideoPlatformMatch, page: Page): TEReader<string> =>
  (ctx) => {
    const toError = (m: VideoPlatformMatch): ControllerError => {
      return toControllerError(
        new Error(`Can't find cover for platform '${m.platform}'`),
      );
    };

    ctx.logger.debug.log("Extracting thumbnail from video platform %j", match);

    return pipe(
      TE.tryCatch(async () => {
        switch (match.platform) {
          case "bitchute": {
            const selector = "picture.vjs-poster img";
            await page.waitForSelector(selector, {
              timeout: 20_000,
            });

            ctx.logger.debug.log(`Found element ${selector}`);
            const coverUrl = await page.$eval(selector, (el) => {
              const coverUrl = el.getAttribute("src");
              return coverUrl;
            });

            ctx.logger.debug.log(
              `Thumbnail from selector ${selector}: ${coverUrl}`,
            );

            return coverUrl;
          }
          case "youtube": {
            const selector = 'div[class*="thumbnail-overlay-image"]';
            await page.waitForSelector(selector, { timeout: 5000 });

            const coverUrl = await page.$eval(selector, (el) => {
              const style = el.getAttribute("style");

              if (style) {
                return style
                  .replace('background-image: url("', "")
                  .replace('");', "");
              }

              return undefined;
            });

            return coverUrl;
          }
          case "peertube":
          case "odysee": {
            let selector = ".vjs-poster";

            const element = await page
              .waitForSelector(selector, { timeout: 10_000 })
              .catch(() => null);

            if (!element) {
              await page.waitForSelector(".content__cover");
              selector = ".content__cover";
            }

            return page.$eval(selector, (el) => {
              const style = el.getAttribute("style");

              const coverUrl = style
                ?.replace('background-image: url("', "")
                .replace('");', "");

              return coverUrl;
            });
          }
          case "rumble": {
            let selector;
            if (match.type === "embed") {
              selector = ".player-Rumble-cls video[poster]";
            } else {
              selector = "#videoPlayer video[poster]";
            }
            try {
              await page.waitForSelector(selector, { timeout: 10_000 });
            } catch (e) {
              selector = "video[poster]";
              await page.waitForSelector(selector, { timeout: 10_000 });
            }

            const videoPosterSrc = await page.$eval(selector, (el) => {
              return el.getAttribute("poster");
            });

            return videoPosterSrc;
          }
          case "dailymotion": {
            if (match.type === "embed") {
              const selector = ".video_poster_image";

              await page.waitForSelector(selector);

              return page.$eval(selector, (el) => {
                return el.getAttribute("src");
              });
            }

            const selector = 'meta[name="og:image:secure_url"]';
            await page.waitForSelector(selector);

            const url = await page.$eval(selector, (el) => {
              return el.getAttribute("content");
            });

            return url;
          }
          default: {
            return undefined;
          }
        }
      }, toControllerError),
      TE.chain((thumb) => {
        if (!thumb) {
          return TE.left(toError(match));
        }
        return TE.right(thumb);
      }),
    );
  };

export const extractThumbnailFromIframe: ExtractThumbnailFromMediaFlow<
  SimpleMedia<Media.IframeVideoType>
> = (media) => (ctx) => {
  ctx.logger.debug.log("Extracting thumbnail from iframe %s", media.location);

  return pipe(
    TE.Do,
    TE.bind("match", () =>
      pipe(
        getPlatform(media.location),
        E.mapLeft(toControllerError),
        TE.fromEither,
      ),
    ),
    TE.bind("buffer", ({ match }) =>
      pipe(
        ctx.puppeteer.execute({}, (browser, page) => {
          return pipe(
            TE.tryCatch(async () => {
              ctx.logger.debug.log("Opening page %s", media.location);
              await page.goto(media.location, { waitUntil: "networkidle2" });
            }, toPuppeteerError),
            TE.chain(() => {
              return pipe(
                extractThumbnailFromVideoPlatform(match, page)(ctx),
                TE.chain((url) => fetchFromRemote(url)(ctx)),
              );
            }),
          );
        }),
        TE.mapLeft(toControllerError),
      ),
    ),
    TE.map(({ buffer }) => [buffer]),
  );
};
