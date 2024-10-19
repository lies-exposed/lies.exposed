import * as fs from "node:fs/promises";
import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  PngType,
  type MP4Type,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import type Ffmpeg from "fluent-ffmpeg";
import * as TE from "fp-ts/lib/TaskEither.js";
import { downloadMP4Video } from "../downloadMP4Video.js";
import { type SimpleMedia } from "../simpleIMedia.type.js";
import { type ExtractThumbnailFromMediaFlow } from "./ExtractThumbnailFlow.type.js";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export type SimpleMP4Media = SimpleMedia<MP4Type>;

export const takeVideoScreenshots =
  ({
    filename,
    media,
    tempVideoFilePath,
    opts: screenshotOpts,
  }: {
    media: SimpleMP4Media;
    filename: string;
    tempVideoFilePath: string;
    opts: Ffmpeg.ScreenshotsConfig;
  }): TEReader<{ key: string; thumbnailName: string }[]> =>
  (ctx) => {
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
              thumbnailName.replace(".png", ""),
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

export const extractMP4Thumbnail: ExtractThumbnailFromMediaFlow<
  SimpleMP4Media
> = (media) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("tempVideoFilePath", () =>
      pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chain((ctx) =>
          downloadMP4Video(media, ctx.config.dirs.temp.media),
        ),
      ),
    ),
    fp.RTE.bind("screenshots", ({ tempVideoFilePath }) => {
      const filename = `${media.id}-thumb-%i.png`;

      return pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.map((ctx) => ({
          timemarks: ["10%", "20%"],
          folder: ctx.config.dirs.temp.media,
          filename,
          count: 2,
        })),
        fp.RTE.chain((screenshotOpts) =>
          takeVideoScreenshots({
            media,
            filename,
            tempVideoFilePath,
            opts: screenshotOpts,
          }),
        ),
      );
    }),
    fp.RTE.bind("buffers", ({ screenshots }): TEReader<ArrayBuffer[]> => {
      return pipe(
        screenshots,
        fp.A.traverse(TE.ApplicativePar)((screenshot) => {
          return pipe(
            TE.tryCatch(async () => {
              return fs.readFile(screenshot.thumbnailName);
            }, toControllerError),
            TE.map((buffer) => new Uint8Array(buffer).buffer),
          );
        }),
        fp.RTE.fromTaskEither,
      );
    }),
    fp.RTE.map(({ buffers }) => {
      return buffers;
    }),
  );
};
