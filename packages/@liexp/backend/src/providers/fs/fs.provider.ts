import fs from "fs";
import path from "path";
import { fp } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import {
  distanceFromNow,
  differenceInHours,
} from "@liexp/shared/lib/utils/date.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { IOError } from "ts-io-error";

const fsLogger = logger.GetLogger("fs");

export class FSError extends IOError {
  name = "FSError";
}

export const toFSError = (e: unknown): FSError => {
  // eslint-disable-next-line
  fsLogger.error.log("Error caught %O", e);
  if (e instanceof Error) {
    return new FSError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: e.stack,
    });
  }

  return new FSError("Internal Error", {
    kind: "ServerError",
    status: "500",
    meta: [String(e)],
  });
};

export interface FSClient {
  _fs: typeof fs;
  resolve: (filePath: string) => string;
  objectExists: (filePath: string) => TE.TaskEither<FSError, boolean>;
  olderThan: (
    filePath: string,
    cacheH?: number,
  ) => TE.TaskEither<FSError, "valid" | "older" | "not-found">;
  getObject: (filePath: string) => TE.TaskEither<FSError, string>;
  writeObject: (filePath: string, data: string) => TE.TaskEither<FSError, void>;
  deleteObject: (
    filePath: string,
    throwIfNoExists?: boolean,
  ) => TE.TaskEither<FSError, void>;
  getOlderThanOr: (
    filePath: string,
    hours?: number,
  ) => <E, A>(te: TE.TaskEither<E, A>) => TE.TaskEither<FSError, A>;
}

export const GetFSClient = (): FSClient => {
  const objectExists: FSClient["objectExists"] = (filePath) => {
    return TE.fromIOEither(
      fp.IOE.tryCatch(() => {
        const filePathDir = path.dirname(filePath);
        const tempFolderExists = fs.existsSync(filePathDir);
        if (!tempFolderExists) {
          fsLogger.debug.log(
            "Folder %s does not exist, creating...",
            filePathDir,
          );
          fs.mkdirSync(filePathDir, { recursive: true });
        }

        const statsExists = fs.existsSync(filePath);
        // fsLogger.debug.log(
        //   "Network file path %s exists? %s",
        //   path.relative(process.cwd(), filePath),
        //   statsExists,
        // );
        return statsExists;
      }, toFSError),
    );
  };

  const olderThan: FSClient["olderThan"] = (filePath, hours = 6) => {
    return pipe(
      objectExists(filePath),
      TE.map((statsExists) => {
        if (statsExists) {
          const { mtime } = fs.statSync(filePath);
          const hoursDelta = differenceInHours(new Date(), mtime);

          fsLogger.debug.log(
            "Last file update %s (%d h > %d h)",
            distanceFromNow(mtime),
            hoursDelta,
            hours,
          );

          return hoursDelta >= hours ? "older" : "valid";
        }

        return "not-found";
      }),
    );
  };

  const getObject: FSClient["getObject"] = (filePath) => {
    fsLogger.debug.log("Getting object from path %s", filePath);
    return pipe(
      fp.IOE.tryCatch(() => fs.readFileSync(filePath, "utf-8"), toFSError),
      fp.TE.fromIOEither,
    );
  };

  const writeObject: FSClient["writeObject"] = (filePath, data) => {
    fsLogger.debug.log("Writing at %s: %d chars", filePath, data.length);
    return pipe(
      TE.fromIOEither(
        fp.IOE.tryCatch(() => {
          fs.writeFileSync(filePath, data, "utf-8");
        }, toFSError),
      ),
    );
  };

  return {
    _fs: fs,
    resolve: (p) => path.resolve(process.cwd(), p),
    objectExists,
    olderThan,
    writeObject,
    getObject,
    deleteObject: (filePath, throwIfNoExists) => {
      fsLogger.debug.log("Deleting object at path %s", filePath);
      return pipe(
        objectExists(filePath),
        TE.chain((exists) => {
          if (exists) {
            return TE.fromIO(() => {
              fs.rmSync(filePath);
            });
          } else {
            if (throwIfNoExists) {
              return TE.left(
                toFSError(new Error(`File ${filePath} don't exists.`)),
              );
            }
            return TE.right(undefined);
          }
        }),
      );
    },
    getOlderThanOr: (fileName, hours) => (te) => {
      return pipe(
        olderThan(fileName, hours),
        fp.TE.chain((older) => {
          if (older === "valid") {
            return pipe(getObject(fileName), fp.TE.map(JSON.parse));
          }
          return pipe(
            te,
            fp.TE.mapLeft((e) => e as FSError),
            fp.TE.chainFirst((body) =>
              writeObject(fileName, JSON.stringify(body)),
            ),
          );
        }),
      );
    },
  };
};
