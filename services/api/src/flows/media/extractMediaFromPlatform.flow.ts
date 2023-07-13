import {
  getPlatformEmbedURL,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media";
import { type URL } from "@liexp/shared/lib/io/http/Common";
import { IframeVideoType } from "@liexp/shared/lib/io/http/Media";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import type * as puppeteer from "puppeteer-core";
import { extractThumbnail } from "./createThumbnail.flow";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { type ControllerError, toControllerError } from "@io/ControllerError";

export const extractDescriptionFromPlatform = (
  m: VideoPlatformMatch,
  page: puppeteer.Page,
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
    TE.orElseW((e) => TE.right("")),
  );
};

export const extractEmbedFromPlatform = (
  url: URL,
  m: VideoPlatformMatch,
  page: puppeteer.Page,
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
    TE.orElse(() => TE.right(url)),
  );
};

export const extractMediaFromPlatform: TEFlow<
  [URL, VideoPlatformMatch, puppeteer.Page],
  Partial<MediaEntity>
> = (ctx) => (url, m, page) => {
  ctx.logger.debug.log("Extracting media from %s (%O)", url, m);
  return pipe(
    sequenceS(TE.ApplicativeSeq)({
      location: extractEmbedFromPlatform(url, m, page),
      description: extractDescriptionFromPlatform(m, page),
      thumbnail: pipe(
        extractThumbnail(m, page),
        TE.mapLeft(toControllerError),
        TE.orElse(
          (): TE.TaskEither<ControllerError, string | undefined> =>
            TE.right(undefined),
        ),
      ),
      type: TE.right(IframeVideoType.value),
    }),
  );
};
