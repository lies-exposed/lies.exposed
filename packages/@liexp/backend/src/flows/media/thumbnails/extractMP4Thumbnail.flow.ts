import * as fs from "node:fs/promises";
import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  PngType,
  type MP4Type,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import type Ffmpeg from "fluent-ffmpeg";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type FFMPEGProviderContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { ServerError } from "../../../errors/ServerError.js";
import { type SimpleMedia } from "../../../io/media.io.js";
import { downloadMP4Video } from "../downloadMP4Video.js";

export type SimpleMP4Media = SimpleMedia<MP4Type>;

const takeVideoScreenshots =
  <C extends FFMPEGProviderContext & LoggerContext & ConfigContext>({
    filename,
    media,
    tempVideoFilePath,
    opts: screenshotOpts,
  }: {
    media: SimpleMP4Media;
    filename: string;
    tempVideoFilePath: string;
    opts: Ffmpeg.ScreenshotsConfig;
  }): ReaderTaskEither<
    C,
    ServerError,
    Array<{ key: string; thumbnailName: string }>
  > =>
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
      TE.mapLeft(ServerError.fromUnknown),
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

export const extractMP4Thumbnail = <
  C extends LoggerContext &
    ConfigContext &
    FSClientContext &
    HTTPProviderContext &
    FFMPEGProviderContext,
>(
  media: SimpleMP4Media,
): ReaderTaskEither<C, ServerError, ArrayBuffer[]> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("tempVideoFilePath", () =>
      pipe(
        fp.RTE.ask<C>(),
        fp.RTE.chain((ctx) =>
          downloadMP4Video(media, ctx.config.dirs.temp.media),
        ),
      ),
    ),
    fp.RTE.bind("screenshots", ({ tempVideoFilePath }) => {
      const filename = `${media.id}-thumb-%i.png`;

      return pipe(
        fp.RTE.ask<C>(),
        fp.RTE.map((ctx) => ({
          timemarks: ["10%", "20%"],
          folder: ctx.config.dirs.temp.media,
          filename,
          count: 2,
        })),
        fp.RTE.chain((screenshotOpts) =>
          takeVideoScreenshots<C>({
            media,
            filename,
            tempVideoFilePath,
            opts: screenshotOpts,
          }),
        ),
      );
    }),
    fp.RTE.bind(
      "buffers",
      ({ screenshots }): ReaderTaskEither<C, ServerError, ArrayBuffer[]> => {
        return pipe(
          screenshots,
          fp.A.traverse(TE.ApplicativePar)((screenshot) => {
            return pipe(
              TE.tryCatch(async () => {
                return fs.readFile(screenshot.thumbnailName);
              }, ServerError.fromUnknown),
              TE.map((arrayBuffer) => new Uint8Array(arrayBuffer).buffer),
            );
          }),
          fp.RTE.fromTaskEither,
        );
      },
    ),
    fp.RTE.map(({ buffers }) => buffers),
  );
};
