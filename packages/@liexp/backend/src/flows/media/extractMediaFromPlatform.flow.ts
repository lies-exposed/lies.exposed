import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  getPlatformEmbedURL,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media.helper.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { IframeVideoType } from "@liexp/shared/lib/io/http/Media/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { type LoggerContext } from "../../context/logger.context.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { extractThumbnailFromVideoPlatform } from "./thumbnails/extractThumbnailFromVideoPlatform.flow.js";

const extractTitleFromPlatform = (
  page: puppeteer.Page,
): TE.TaskEither<ServerError, string> => {
  return pipe(
    TE.tryCatch(async () => {
      const title = await page.title();

      return title;
    }, ServerError.fromUnknown),
  );
};

const extractDescriptionFromPlatform = (
  m: VideoPlatformMatch,
  page: puppeteer.Page,
): TE.TaskEither<ServerError, string | undefined> => {
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
    }, ServerError.fromUnknown),
    TE.orElseW((e) => TE.right("")),
  );
};

const extractEmbedFromPlatform = (
  url: URL,
  m: VideoPlatformMatch,
  page: puppeteer.Page,
): TE.TaskEither<ServerError, string> => {
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
    }, ServerError.fromUnknown),
    TE.orElse(() => TE.right(url)),
  );
};

export const extractMediaFromPlatform =
  <C extends LoggerContext>(
    url: URL,
    m: VideoPlatformMatch,
    page: puppeteer.Page,
  ): ReaderTaskEither<C, ServerError, Partial<MediaEntity>> =>
  (ctx) => {
    ctx.logger.debug.log("Extracting media from %s (%O)", url, m);
    return pipe(
      sequenceS(TE.ApplicativeSeq)({
        location: extractEmbedFromPlatform(url, m, page),
        label: extractTitleFromPlatform(page),
        description: extractDescriptionFromPlatform(m, page),
        thumbnail: pipe(
          extractThumbnailFromVideoPlatform(m, page)(ctx),
          TE.orElse(
            (): TE.TaskEither<ServerError, string | undefined> =>
              TE.right(undefined),
          ),
        ),
        type: TE.right(IframeVideoType.value),
      }),
    );
  };
