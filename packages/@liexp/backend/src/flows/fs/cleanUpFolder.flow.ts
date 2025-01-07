import * as fs from "fs";
import path from "path";
import { fp, flow, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type FSError } from "../../providers/fs/fs.provider.js";
import { olderThan } from "./olderThan.flow.js";

export const cleanUpFolder =
  <C extends FSClientContext & LoggerContext>(
    tempFolder: string,
    time: number,
  ): ReaderTaskEither<C, FSError, void> =>
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
    );
  };
