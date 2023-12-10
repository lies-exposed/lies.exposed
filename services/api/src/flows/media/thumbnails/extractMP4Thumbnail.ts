import fs from "fs";
import path from "path";
import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { PngType, type MP4Type } from "@liexp/shared/lib/io/http/Media.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import type Ffmpeg from "fluent-ffmpeg";
import * as TE from "fp-ts/lib/TaskEither.js";
import { downloadMP4Video } from "../downloadMP4Video.js";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export type SimpleMedia = Pick<Media.Media, "id" | "location"> & {
  type: MP4Type;
};

export const takeVideoScreenshots: TEFlow<
  [
    {
      media: SimpleMedia;
      filename: string;
      tempVideoFilePath: string;
      opts: Ffmpeg.ScreenshotsConfig;
    },
  ],
  Array<{ key: string; thumbnailName: string }>
> =
  (ctx) =>
  ({ filename, media, tempVideoFilePath, opts: screenshotOpts }) => {
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
      TE.map(() => {
        return pipe(
          Array.from({ length: 2 }),
          fp.A.mapWithIndex((i) => {
            const thumbnailName = filename.replace("%i", (i + 1).toString());

            ctx.logger.debug.log("Thumbnail file name %s", thumbnailName);

            const key = getMediaKey(
              "media",
              media.id,
              thumbnailName,
              PngType.value,
            );

            ctx.logger.debug.log("Thumbnail key %s", key);

            return {
              key,
              thumbnailName: path.resolve(
                ctx.config.dirs.temp.media,
                thumbnailName,
              ),
            };
          }),
        );
      }),
    );
  };

export const extractMP4Thumbnail: ExtractThumbnailFlow<MP4Type> =
  (ctx) => (media) => {
    return pipe(
      TE.Do,
      TE.bind("tempVideoFilePath", () =>
        downloadMP4Video(ctx)(media, ctx.config.dirs.temp.media),
      ),
      TE.bind("screenshots", ({ tempVideoFilePath }) => {
        const filename = `${media.id}-thumb-%i.png`;

        const screenshotOpts = {
          timemarks: ["10%", "20%"],
          folder: ctx.config.dirs.temp.media,
          filename,
          count: 2,
        };

        return pipe(
          takeVideoScreenshots(ctx)({
            media,
            filename,
            tempVideoFilePath,
            opts: screenshotOpts,
          }),
        );
      }),
      TE.map(({ screenshots }) => {
        return screenshots.map(({ key, thumbnailName }) => ({
          Key: key,
          Body: fs.createReadStream(thumbnailName),
          ContentType: PngType.value,
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
