import { fp, pipe, flow } from "@liexp/core/lib/fp";
import { type MediaExtra } from "@liexp/shared/lib/io/http/Media";
import type Ffmpeg from "fluent-ffmpeg";
import { downloadMP4Video } from '../downloadMP4Video';
import { type SimpleMedia } from '../thumbnails/extractMP4Thumbnail';
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const extractVideoFFProbeData: TEFlow<[string], Ffmpeg.FfprobeData> = (
  ctx,
) => flow(ctx.ffmpeg.ffprobe, fp.TE.mapLeft(toControllerError));


export const extractMP4Extra: TEFlow<[SimpleMedia], MediaExtra> =
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
        duration: metadata.format.duration ?? 0,
      })),
    );
  };
