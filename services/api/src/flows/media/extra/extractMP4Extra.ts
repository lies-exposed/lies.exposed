import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ThumbnailsExtraMonoid,
  type VideoExtra,
} from "@liexp/shared/lib/io/http/Media/index.js";
import type Ffmpeg from "fluent-ffmpeg";
import { downloadMP4Video } from "../downloadMP4Video.js";
import { type SimpleMP4Media } from "../thumbnails/extractMP4Thumbnail.flow.js";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

const extractVideoFFProbeData =
  (location: string): TEReader<Ffmpeg.FfprobeData> =>
  (ctx) =>
    pipe(ctx.ffmpeg.ffprobe(location), fp.TE.mapLeft(toControllerError));

export const extractMP4Extra = (
  media: SimpleMP4Media,
): TEReader<VideoExtra> => {
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
