import fs from "fs";
import path from "path";
import { fp } from "@liexp/core/lib/fp";
import { type Media } from "@liexp/shared/lib/io/http";
import { type MP4Type } from "@liexp/shared/lib/io/http/Media";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils";
import axios from "axios";
import type Ffmpeg from "fluent-ffmpeg";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const takeVideoScreenshots: TEFlow<
  [string, Ffmpeg.ScreenshotsConfig],
  Ffmpeg.ScreenshotsConfig
> = (ctx) => (tempVideoFilePath, screenshotOpts) => {
  return pipe(
    ctx.ffmpeg.runCommand((ffmpeg) => {
      const command = ffmpeg(tempVideoFilePath)
        .inputFormat("mp4")
        .noAudio()
        .screenshots(screenshotOpts);
      // .outputOptions("-movflags frag_keyframe+empty_moov");
      return command;
    }),
    TE.mapLeft(toControllerError),
    TE.map(() => screenshotOpts),
  );
};

export const downloadVideo: TEFlow<
  [Pick<Media.Media, "id" | "location"> & { type: MP4Type }, string],
  string
> = (ctx) => (media, tempFolder) => {
  const tempVideoFilePath = path.resolve(tempFolder, `${media.id}.mp4`);

  if (fs.existsSync(tempVideoFilePath)) {
    return TE.right(tempVideoFilePath);
  }

  return pipe(
    TE.tryCatch(() => {
      ctx.logger.debug.log("Getting mp4 from %s", media.location);
      return axios.get(media.location, {
        responseType: "stream",
      });
    }, toControllerError),
    TE.chain((stream) => {
      const tempVideoFile = fs.createWriteStream(tempVideoFilePath);

      return pipe(
        TE.tryCatch(() => {
          stream.data.pipe(tempVideoFile);

          return new Promise((resolve, reject) => {
            tempVideoFile.on("error", (e) => {
              reject(e);
            });

            tempVideoFile.on("finish", () => {
              resolve(tempVideoFilePath);
            });
          });
        }, toControllerError),
      );
    }),
  );
};

export const extractMP4Thumbnail: ExtractThumbnailFlow<MP4Type> =
  (ctx) => (media) => {
    const tempFolder = path.resolve(process.cwd(), "temp");

    return pipe(
      TE.Do,
      TE.bind("tempVideoFilePath", () => downloadVideo(ctx)(media, tempFolder)),
      TE.bind("screenshots", ({ tempVideoFilePath }) => {
        const filename = `${media.id}-thumb-%i.png`;

        const screenshotOpts = {
          timemarks: ["10%", "20%"],
          folder: tempFolder,
          filename,
          count: 2,
        };

        return pipe(
          takeVideoScreenshots(ctx)(tempVideoFilePath, screenshotOpts),
          TE.map(() => {
            return pipe(
              Array.from({ length: 2 }),
              fp.A.mapWithIndex((i) => {
                const thumbnailName = filename.replace(
                  "%i",
                  (i + 1).toString(),
                );

                ctx.logger.debug.log("Thumbnail file name %s", thumbnailName);

                const key = getMediaKey(
                  "media",
                  media.id,
                  thumbnailName,
                  "image/png",
                );

                ctx.logger.debug.log("Thumbnail key %s", key);

                return {
                  key,
                  thumbnailName: path.resolve(tempFolder, thumbnailName),
                };
              }),
            );
          }),
        );
      }),
      TE.map(({ screenshots }) => {
        return screenshots.map(({ key, thumbnailName }) => ({
          Key: key,
          Body: fs.createReadStream(thumbnailName),
          ContentType: "image/png",
          Bucket: ctx.env.SPACE_BUCKET,
          ACL: "public-read",
        }));
      }),
      // TE.chainFirst(() =>
      //   TE.tryCatch(() => {
      //     fs.rmSync(tempVideoFilePath);
      //     return Promise.resolve();
      //   }, toControllerError),
      // ),
    );
  };
