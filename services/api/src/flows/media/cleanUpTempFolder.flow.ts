import * as fs from "fs";
import path from "path";
import { olderThan } from "@liexp/backend/lib/flows/fs/olderThan.flow.js";
import { fp, flow, pipe } from "@liexp/core/lib/fp/index.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const cleanUpFolder =
  (tempFolder: string, time: number): TEReader<void> =>
  (ctx) => {
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
              olderThan(filePath, time)(ctx),
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

export const cleanUpTempMedia =
  (time: number): TEReader<void> =>
  (ctx) => {
    return cleanUpFolder(ctx.config.dirs.temp.media, time)(ctx);
  };
