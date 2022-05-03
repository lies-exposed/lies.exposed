import fs from "fs";
import path from "path";
import { getPlatform, VideoPlatformMatch } from "@liexp/shared/helpers/media";
import { Media } from "@liexp/shared/io/http";
import { toPuppeteerError } from "@liexp/shared/providers/puppeteer.provider";
import axios from "axios";
import { sequenceS } from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Page } from "puppeteer-core";
import {
  ControllerError,
  ServerError,
  toControllerError,
} from "@io/ControllerError";
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
              .replace('");', "");

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
              .replace('");', "");

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
  (location: Media.Media): TE.TaskEither<ControllerError, string> => {
    ctx.logger.debug.log("Extracting thumbnail from url %s", location);

    if (Media.MP4Type.is(location.type)) {
      return pipe(
        TE.tryCatch(
          () =>
            axios.get(location.location, {
              responseType: "stream",
            }),
          toControllerError
        ),
        TE.chain((stream) => {
          const tempFolder = path.resolve(process.cwd(), "temp");

          const tempVideoFilePath = path.resolve(
            tempFolder,
            `${location.id}.mp4`
          );
          const tempVideoFile = fs.createWriteStream(tempVideoFilePath);

          const filename = `${location.id}-thumb-%i.png`;
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
              const url = location.location.split("/");
              const thumbnailName = url[url.length - 1].replace(
                ".mp4",
                "-thumbnail.png"
              );

              const key = `public/media/${
                url[url.length - 2]
              }/${thumbnailName}`;

              return ctx.s3.upload({
                Key: key,
                Body: fs.createReadStream(tempThumbnail),
                ContentType: "image/png",
                Bucket: ctx.env.SPACE_BUCKET,
              });
            }),
            TE.map((thumb) => thumb.Location),
            TE.chainFirst(() =>
              TE.tryCatch(() => {
                fs.rmSync(tempThumbnail);
                fs.rmSync(tempVideoFilePath);
                return Promise.resolve();
              }, toControllerError)
            )
          );
        })
      );
    }

    if (Media.ImageType.is(location.type)) {
      return TE.right(location.location);
    }

    return pipe(
      sequenceS(TE.ApplyPar)({
        html: pipe(
          ctx.puppeteer.getBrowser(location.location, {}),
          TE.chain((b) => {
            return TE.tryCatch(async () => {
              const page = await b.pages().then((p) => p[0]);
              await page.goto(location.location, { waitUntil: "networkidle0" });

              return page;
            }, toPuppeteerError);
          }),
          TE.mapLeft((e) => ServerError(e as any))
        ),
        match: pipe(
          getPlatform(location.location),
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
