import fs from "fs";
import path from "path";
import { fp } from "@liexp/core/fp";
import * as logger from "@liexp/core/logger";
import differenceInHours from "date-fns/differenceInHours";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { IOError } from "ts-io-error";
import { distanceFromNow } from "../../utils/date";

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
    cacheH?: number
  ) => TE.TaskEither<FSError, boolean>;
  getObject: (filePath: string) => TE.TaskEither<FSError, string>;
  writeObject: (filePath: string, data: string) => TE.TaskEither<FSError, void>;
  deleteObject: (filePath: string) => TE.TaskEither<FSError, void>;
}

export const GetFSClient = (): FSClient => {
  const objectExists: FSClient["objectExists"] = (filePath, cacheH = 6) => {
    return TE.fromIOEither(
      fp.IOE.tryCatch(() => {
        const filePathDir = path.dirname(filePath);
        const tempFolderExists = fs.existsSync(filePathDir);
        if (!tempFolderExists) {
          fsLogger.debug.log(
            "Folder %s does not exist, creating...",
            filePathDir
          );
          fs.mkdirSync(filePathDir, { recursive: true });
        }

        const statsExists = fs.existsSync(filePath);
        fsLogger.debug.log(
          "Network file path %s exists? %s",
          path.relative(process.cwd(), filePath),
          statsExists
        );
        return statsExists;
      }, toFSError)
    );
  };

  const olderThan: FSClient["olderThan"] = (filePath, cacheH = 6) => {
    return pipe(
      objectExists(filePath),
      TE.map((statsExists) => {
        if (statsExists) {
          const { mtime } = fs.statSync(filePath);
          const hoursDelta = differenceInHours(new Date(), mtime);

          fsLogger.debug.log(
            "Last network file update %s (%d h)",
            distanceFromNow(mtime),
            hoursDelta
          );

          return hoursDelta < cacheH;
        }

        return false;
      })
    );
  };

  return {
    resolve: (p) => path.resolve(process.cwd(), p),
    objectExists,
    olderThan,
    writeObject: (filePath, data) => {
      fsLogger.debug.log("Writing at %s: %d chars", filePath, data.length);
      return pipe(TE.fromIO(() => { fs.writeFileSync(filePath, data, "utf-8"); }));
    },
    getObject: (filePath) => {
      fsLogger.debug.log("Getting object from path %s", filePath);
      return pipe(
        TE.fromIO(() => fs.readFileSync(filePath, "utf-8")),
      );
    },
    deleteObject: (filePath) => {
      fsLogger.debug.log("Deleting object at path %s", filePath);
      return pipe(TE.fromIO(() => { fs.rmSync(filePath); }));
    },
  };
};
