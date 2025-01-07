import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ThumbnailsExtraMonoid,
  type VideoExtra,
} from "@liexp/shared/lib/io/http/Media/index.js";
import type Ffmpeg from "fluent-ffmpeg";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type FFMPEGProviderContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { ServerError } from "../../../errors/ServerError.js";
import { downloadMP4Video } from "../downloadMP4Video.js";
import { type SimpleMP4Media } from "../thumbnails/extractMP4Thumbnail.flow.js";

const extractVideoFFProbeData =
  <C extends FFMPEGProviderContext>(
    location: string,
  ): ReaderTaskEither<C, ServerError, Ffmpeg.FfprobeData> =>
  (ctx) =>
    pipe(ctx.ffmpeg.ffprobe(location), fp.TE.mapLeft(ServerError.fromUnknown));

export const extractMP4Extra = <
  C extends FFMPEGProviderContext &
    ConfigContext &
    LoggerContext &
    FSClientContext &
    HTTPProviderContext,
>(
  media: SimpleMP4Media,
): ReaderTaskEither<C, ServerError, VideoExtra> => {
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
    fp.RTE.bind("metadata", ({ tempVideoFilePath }) =>
      extractVideoFFProbeData(tempVideoFilePath),
    ),
    fp.RTE.map(({ metadata }) => ({
      ...ThumbnailsExtraMonoid.empty,
      width: metadata.streams[0].width,
      height: metadata.streams[0].height,
      // keep duration in seconds
      duration: Math.floor(metadata.format.duration ?? 0),
    })),
  );
};
