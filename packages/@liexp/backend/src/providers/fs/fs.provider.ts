import fs from "fs";
import path from "path";
import { fp } from "@liexp/core/lib/fp";
import * as logger from "@liexp/core/lib/logger";
import {
  distanceFromNow,
  differenceInHours,
} from "@liexp/shared/lib/utils/date.utils";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IOError } from "ts-io-error";

const fsLogger = logger.GetLogger("fs");

class FSError extends IOError {}

export const toFSError = (e: unknown): FSError => {
  // eslint-disable-next-line
  fsLogger.error.log("Space Error %O", e);
  if (e instanceof Error) {
    return {
      name: "FSError",
      status: 500,
      message: e.message,
      details: {
        kind: "ServerError",
        status: "500",
        meta: e.stack,
      },
    };
  }
  return {
    name: "FSError",
    status: 500,
    message: "Internal Error",
    details: {
      kind: "ServerError",
      status: "500",
    },
  };
};

export interface FSClient {
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
    time?: number,
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
    return pipe(TE.fromIO(() => fs.readFileSync(filePath, "utf-8")));
  };

  const writeObject: FSClient["writeObject"] = (filePath, data) => {
    fsLogger.debug.log("Writing at %s: %d chars", filePath, data.length);
    return pipe(
      TE.fromIO(() => {
        fs.writeFileSync(filePath, data, "utf-8");
      }),
    );
  };

  return {
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
            fp.TE.mapLeft(toFSError),
            fp.TE.chainFirst((body) =>
              writeObject(fileName, JSON.stringify(body)),
            ),
          );
        }),
      );
    },
  };
};
