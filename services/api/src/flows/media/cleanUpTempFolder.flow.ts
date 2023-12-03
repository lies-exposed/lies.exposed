import * as fs from "fs";
import path from "path";
import { fp, flow, pipe } from "@liexp/core/lib/fp";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const cleanUpFolder: TEFlow<[string, number], void> =
  (ctx) => (tempFolder, time) => {
    ctx.logger.info.log("Clean up %s folder...", tempFolder);
    return pipe(
      fp.TE.fromIO(() => {
        const files = fs
          .readdirSync(tempFolder, "utf8")
          .map((f) => path.resolve(tempFolder, f));

        return files.filter((f) => {
          const isDir = fs
            .lstatSync(f, {
              throwIfNoEntry: false,
            })
            ?.isDirectory();

          return f !== "." && !isDir;
        });
      }),
      fp.TE.chain(
        flow(
          fp.A.map((filePath) => {
            return pipe(
              ctx.fs.olderThan(filePath, time),
              fp.TE.chain((older) => {
                if (older) {
                  ctx.logger.info.log(
                    `File ${filePath} older than ${time} hours`,
                  );
                  return ctx.fs.deleteObject(filePath);
                }

                return fp.TE.right(undefined);
              }),
            );
          }),
          fp.A.sequence(fp.TE.ApplicativePar),
          fp.TE.map(() => undefined),
        ),
      ),
      fp.TE.mapLeft(toControllerError),
    );
  };

export const cleanUpTempMedia: TEFlow<[number], void> = (ctx) => (time) => {
  return cleanUpFolder(ctx)(ctx.config.dirs.temp.media, time);
};
