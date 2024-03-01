import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { toPuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  getPlatform,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import {
  getMediaKeyFromLocation,
  getMediaThumbKey,
} from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Page } from "puppeteer-core";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type.js";
import { type TEFlow } from "#flows/flow.types.js";
import { ServerError, toControllerError } from "#io/ControllerError.js";

export const createFromRemote: TEFlow<
  [string, string, Media.MediaType],
  PutObjectCommandInput
> = (ctx) => (id, location, contentType) => {
  return pipe(
    ctx.http.get<ReadableStream>(location, {
      responseType: "stream",
    }),
    TE.mapLeft(toControllerError),
    TE.map((stream) => {
      const key = getMediaKeyFromLocation(location);

      ctx.logger.debug.log("Key %s (%s) for location %s", key, id, location);

      return {
        Key: getMediaThumbKey(id, "image/jpg"),
        Body: stream,
        ACL: "public-read",
        Bucket: ctx.env.SPACE_BUCKET,
        ContentType: contentType,
      };
    }),
  );
};

export const extractThumbnailFromVideoPlatform = (
  match: VideoPlatformMatch,
  page: Page,
): TE.TaskEither<Error, string> => {
  const toError = (m: VideoPlatformMatch): Error => {
    return new Error(`Can't find cover for platform '${m.platform}'`);
  };

  return pipe(
    TE.tryCatch(async () => {
      switch (match.platform) {
        case "bitchute": {
          await page.waitForSelector(".plyr__poster");

          return page.$eval(".plyr__poster", (el) => {
            const style = el.getAttribute("style");

            const coverUrl = style
              ?.replace('background-image: url("', "")
              .replace('");', "");

            return coverUrl;
          });
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
          const selector = ".vjs-poster";
          await page.waitForSelector(selector);

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
    }, E.toError),
    TE.chain((thumb) => {
      if (!thumb) {
        return TE.left(toError(match));
      }
      return TE.right(thumb);
    }),
  );
};

export const extractThumbnailFromIframe: ExtractThumbnailFlow<
  Media.IframeVideoType
> = (ctx) => (media) => {
  return pipe(
    sequenceS(TE.ApplyPar)({
      html: pipe(
        ctx.puppeteer.getBrowserFirstPage(media.location, {}),
        TE.chain((page) => {
          return TE.tryCatch(async () => {
            await page.goto(media.location, { waitUntil: "networkidle0" });

            return page;
          }, toPuppeteerError);
        }),
        TE.mapLeft((e) => ServerError(e as any)),
      ),
      match: pipe(
        getPlatform(media.location),
        E.mapLeft(toControllerError),
        TE.fromEither,
      ),
    }),
    TE.chain(({ html, match }) => {
      return pipe(
        extractThumbnailFromVideoPlatform(match, html),
        TE.mapLeft(toControllerError),
        TE.chain((url) => createFromRemote(ctx)(media.id, url, "image/jpg")),
        TE.map((url) => [url]),
        TE.chainFirst(() =>
          TE.tryCatch(() => html.browser().close(), toControllerError),
        ),
      );
    }),
  );
};
