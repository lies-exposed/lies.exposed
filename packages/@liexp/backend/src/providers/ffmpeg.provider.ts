import { type Stream } from "stream";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import type ffmpeg from "fluent-ffmpeg";
import * as TE from "fp-ts/lib/TaskEither.js";

const ffmpegLogger = GetLogger("ffmpeg");

export interface FFMPEGProvider {
  runCommand: (
    f: (ff: typeof ffmpeg) => ffmpeg.FfmpegCommand,
  ) => TE.TaskEither<Error, void>;
  ffprobe: (file: string | Stream) => TE.TaskEither<Error, ffmpeg.FfprobeData>;
}

const toError = (e: unknown): Error => {
  ffmpegLogger.error.log("An error has occurred %O", e);

  if (e instanceof Error) {
    return e;
  }
  return new Error("Unknown error");
};

export type GetFFMPEGProvider = (ff: typeof ffmpeg) => FFMPEGProvider;

export const GetFFMPEGProvider: GetFFMPEGProvider = (ffmpeg) => {
  return {
    ffprobe: (file) =>
      TE.taskify<string, Error, ffmpeg.FfprobeData>(
        ffmpeg.ffprobe.bind(ffmpeg.ffprobe),
      )(file as any),
    runCommand: (f) => {
      return TE.tryCatch(() => {
        return new Promise((resolve, reject) => {
          const command = f(ffmpeg);

          command.on("start", (...args) => {
            ffmpegLogger.debug.log("Command started %O", args);
          });

          command.on("end", (...args) => {
            ffmpegLogger.debug.log("Command finished %O", args);
            resolve(undefined);
          });

          command.on("error", function (err, stdout, stderr) {
            if (err) {
              ffmpegLogger.error.log("An error occurred %O", err);
              ffmpegLogger.error.log("stdout:\n %s", stdout);
              ffmpegLogger.error.log("stderr:\n %s", stderr);
              reject(err);
              return;
            }
            reject(new Error("Unknown"));
          });

          // command.run();
        });
      }, toError);
    },
  };
};
