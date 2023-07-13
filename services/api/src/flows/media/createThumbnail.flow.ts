import fs from "fs";
import path from "path";
import { toPuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider";
import {
  getPlatform,
  type VideoPlatformMatch,
} from "@liexp/shared/lib/helpers/media";
import { Media } from "@liexp/shared/lib/io/http";
import { ImageType } from "@liexp/shared/lib/io/http/Media";
import {
  getMediaKey,
  getMediaKeyFromLocation,
  getMediaThumbKey,
} from "@liexp/shared/lib/utils/media.utils";
import axios from "axios";
import * as Canvas from "canvas";
import { sequenceS } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import * as pdfJS from "pdfjs-dist/legacy/build/pdf";
import { type RenderParameters } from "pdfjs-dist/types/src/display/api";
import { type Page } from "puppeteer-core";
import { type TEFlow } from "@flows/flow.types";
import {
  ServerError,
  toControllerError,
  type ControllerError,
} from "@io/ControllerError";

export const createFromRemote: TEFlow<
  [string, string, Media.MediaType],
  string
> =
  (ctx) =>
  (id, location, contentType): TE.TaskEither<ControllerError, string> => {
    return pipe(
      TE.tryCatch(
        () =>
          axios.get(location, {
            responseType: "stream",
          }),
        toControllerError,
      ),
      TE.chain((stream) => {
        const key = getMediaKeyFromLocation(location);

        ctx.logger.debug.log("Key %s (%s) for location %s", key, id, location);

        return ctx.s3.upload({
          Key: getMediaThumbKey(id, "image/jpg"),
          Body: stream.data,
          ACL: "public-read",
          Bucket: ctx.env.SPACE_BUCKET,
          ContentType: contentType,
        });
      }),
      TE.map((r) => r.Location),
      TE.filterOrElse(t.string.is, () => toControllerError(new Error())),
    );
  };

export const extractThumbnail = (
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

          return await page.$eval(".plyr__poster", (el) => {
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

          return await page.$eval(selector, (el) => {
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
          await page.waitForSelector(selector);

          const videoPosterSrc = await page.$eval(selector, (el) => {
            return el.getAttribute("poster");
          });

          return videoPosterSrc;
        }
        case "dailymotion": {
          if (match.type === "embed") {
            const selector = ".video_poster_image";

            await page.waitForSelector(selector);

            return await page.$eval(selector, (el) => {
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

export const createThumbnail: TEFlow<
  [Pick<Media.Media, "id" | "location" | "type">],
  string
> = (ctx) => (media) => {
  ctx.logger.debug.log(
    "Extracting thumbnail from url %s with type %s",
    media.location,
    media.type,
  );

  if (Media.PDFType.is(media.type)) {
    return pipe(
      TE.tryCatch(async () => {
        const pdfStream = await axios.get(media.location, {
          responseType: "arraybuffer",
        });

        const pdf = await pdfJS.getDocument({
          data: new Uint16Array(pdfStream.data),
        }).promise;

        const page = await pdf.getPage(1);
        return page;
      }, toControllerError),
      TE.chain((page) => {
        return pipe(
          TE.tryCatch(async () => {
            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const outputScale = 1;

            const canvas = Canvas.createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const transform =
              outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : undefined;

            const renderContext: RenderParameters = {
              canvasContext: context as any,
              transform,
              viewport,
            };
            await page.render(renderContext).promise;
            return canvas.toBuffer(ImageType.types[2].value);
          }, toControllerError),

          TE.chainFirst(() => TE.fromIO(() => page.cleanup())),
        );
      }),
      TE.chain((screenshotPath) => {
        const thumbnailName = `${media.id}-thumbnail`;

        const key = getMediaKey(
          "media",
          media.id,
          thumbnailName,
          ImageType.types[2].value,
        );

        return ctx.s3.upload({
          Key: key,
          Body: screenshotPath,
          ContentType: ImageType.types[2].value,
          Bucket: ctx.env.SPACE_BUCKET,
          ACL: "public-read",
        });
      }),
      TE.map((s) => s.Location),
      TE.filterOrElse(t.string.is, () => toControllerError(new Error())),
    );
  }

  if (Media.MP4Type.is(media.type)) {
    return pipe(
      TE.tryCatch(() => {
        ctx.logger.debug.log("Getting mp4 from %s", media.location);
        return axios.get(media.location, {
          responseType: "stream",
        });
      }, toControllerError),
      TE.chain((stream) => {
        const tempFolder = path.resolve(process.cwd(), "temp");

        const tempVideoFilePath = path.resolve(tempFolder, `${media.id}.mp4`);
        const tempVideoFile = fs.createWriteStream(tempVideoFilePath);

        const filename = `${media.id}-thumb-%i.png`;
        const tempFile = path.resolve(tempFolder, filename);

        const tempThumbnail = tempFile.replace("%i", "1");

        const screenshotOpts = {
          timemarks: [2],
          folder: tempFolder,
          filename,
          count: 1,
        };

        return pipe(
          TE.tryCatch(() => {
            stream.data.pipe(tempVideoFile);

            return new Promise((resolve, reject) => {
              if (fs.existsSync(tempFile)) {
                fs.rmSync(tempFile);
              }

              tempVideoFile.on("error", (e) => {
                reject(e);
              });

              tempVideoFile.on("finish", () => {
                resolve(undefined);
              });
            });
          }, toControllerError),
          TE.chain(() => {
            return ctx.ffmpeg.runCommand((ffmpeg) => {
              const command = ffmpeg(tempVideoFilePath)
                .inputFormat("mp4")
                .noAudio()
                .screenshots(screenshotOpts);
              // .outputOptions("-movflags frag_keyframe+empty_moov");

              return command;
            });
          }),
          TE.mapLeft(toControllerError),
          // read file from temp path
          TE.chain(() => {
            const url = media.location.split("/");
            const thumbnailName = url[url.length - 1]
              .replace(".mp4", "")
              .concat("-thumbnail");

            ctx.logger.debug.log("Thumbnail file name %s", thumbnailName);
            const key = getMediaKey(
              "media",
              media.id,
              thumbnailName,
              "image/png",
            );

            ctx.logger.debug.log("Thumbnail key %s", key);

            return ctx.s3.upload({
              Key: key,
              Body: fs.createReadStream(tempThumbnail),
              ContentType: "image/png",
              Bucket: ctx.env.SPACE_BUCKET,
              ACL: "public-read",
            });
          }),
          TE.map((r) => r.Location),
          TE.chainFirst(() =>
            TE.tryCatch(() => {
              fs.rmSync(tempThumbnail);
              fs.rmSync(tempVideoFilePath);
              return Promise.resolve();
            }, toControllerError),
          ),
        );
      }),
    );
  }

  if (Media.ImageType.is(media.type)) {
    return TE.right(media.location);
  }

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
        E.mapLeft((e) => ServerError(e as any)),
        TE.fromEither,
      ),
    }),
    TE.chain(({ html, match }) => {
      return pipe(
        extractThumbnail(match, html),
        TE.mapLeft((e) => ServerError(e as any)),
        TE.chain((url) => createFromRemote(ctx)(media.id, url, "image/jpg")),
        TE.chainFirst(() =>
          TE.tryCatch(
            () => html.browser().close(),
            (e) => ServerError(e as any),
          ),
        ),
      );
    }),
  );
};
