import {
  getPlatformEmbedURL,
  VideoPlatformMatch,
} from "@liexp/shared/helpers/media";
import { URL } from "@liexp/shared/io/http/Common";
import { IframeVideoType } from "@liexp/shared/io/http/Media";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import type puppeteer from "puppeteer-core";
import { extractThumbnail } from "./createThumbnail.flow";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError, toControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const extractDescriptionFromPlatform = (
  m: VideoPlatformMatch,
  page: puppeteer.Page
): TE.TaskEither<ControllerError, string | undefined> => {
  return pipe(
    TE.tryCatch(async () => {
      switch (m.platform) {
        case "youtube": {
          const selector = 'meta[property="og:title"]';
          await page.waitForSelector(selector);

          const description = await page.$eval(selector, (el) => {
            return el.getAttribute("content");
          });

          return description;
        }

        case "rumble": {
          const selector = 'script[type="application/ld+json"]';
          await page.waitForSelector(selector);

          const rumbleState = await page.$eval(selector, (el) => {
            return JSON.parse(el.innerHTML)[0];
          });

          return rumbleState.description;
        }
      }
    }, toControllerError),
    TE.orElseW((e) => TE.right(undefined))
  );
};

export const extractEmbedFromPlatform = (
  url: URL,
  m: VideoPlatformMatch,
  page: puppeteer.Page
): TE.TaskEither<ControllerError, string> => {
  return pipe(
    TE.tryCatch(async () => {
      await page.goto(url);

      switch (m.platform) {
        case "rumble": {
          const selector = 'script[type="application/ld+json"]';
          await page.waitForSelector(selector);

          const rumbleState = await page.$eval(selector, (el) => {
            return JSON.parse(el.innerHTML)[0];
          });

          return rumbleState.embedUrl;
        }
        default:
          return getPlatformEmbedURL(m, url);
      }
    }, toControllerError),
    TE.orElse(() => TE.right(url))
  );
};

export const extractMediaFromPlatform =
  (ctx: RouteContext) =>
  (
    url: URL,
    m: VideoPlatformMatch,
    page: puppeteer.Page
  ): TE.TaskEither<ControllerError, Partial<MediaEntity>> => {
    ctx.logger.debug.log("Extracting media from %s (%O)", url, m);
    return pipe(
      sequenceS(TE.ApplicativeSeq)({
        description: extractDescriptionFromPlatform(m, page),
        location: extractEmbedFromPlatform(url, m, page),
        thumbnail: pipe(
          extractThumbnail(m, page),
          TE.mapLeft(toControllerError),
          TE.orElse(
            (): TE.TaskEither<ControllerError, string | undefined> =>
              TE.right(undefined)
          )
        ),
        type: TE.right(IframeVideoType.value),
      })
    );
  };
