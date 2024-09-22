import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ThumbnailsExtraMonoid,
  type VideoExtra,
} from "@liexp/shared/lib/io/http/Media/index.js";
import type Ffmpeg from "fluent-ffmpeg";
import { downloadMP4Video } from "../downloadMP4Video.js";
import { type SimpleMP4Media } from "../thumbnails/extractMP4Thumbnail.flow.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const extractVideoFFProbeData: TEFlow<[string], Ffmpeg.FfprobeData> = (
  ctx,
) => flow(ctx.ffmpeg.ffprobe, fp.TE.mapLeft(toControllerError));

export const extractMP4Extra: TEFlow<[SimpleMP4Media], VideoExtra> =
  (ctx) => (media) => {
    return pipe(
      fp.TE.Do,
      fp.TE.bind("tempVideoFilePath", () =>
        downloadMP4Video(ctx)(media, ctx.config.dirs.temp.media),
      ),
      fp.TE.bind("metadata", ({ tempVideoFilePath }) =>
        extractVideoFFProbeData(ctx)(tempVideoFilePath),
      ),
      fp.TE.map(({ metadata }) => ({
        ...ThumbnailsExtraMonoid.empty,
        width: metadata.streams[0].width,
        height: metadata.streams[0].height,
        // keep duration in seconds
        duration: Math.floor(metadata.format.duration ?? 0),
      })),
    );
  };
