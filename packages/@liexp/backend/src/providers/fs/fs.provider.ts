import type * as fs from "fs";
import path from "path";
import { fp } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { IOError } from "@ts-endpoint/core";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

const fsLogger = logger.GetLogger("fs");

export class FSError extends IOError {
  name = "FSError";
}

export const toFSError = (e: unknown): FSError => {
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

export interface GetFSClientContext {
  client: typeof fs;
}

export interface FSClient {
  _fs: typeof fs;
  resolve: (filePath: string) => string;
  objectExists: (filePath: string) => TE.TaskEither<FSError, boolean>;
  getObject: (filePath: string) => TE.TaskEither<FSError, string>;
  writeObject: (filePath: string, data: string) => TE.TaskEither<FSError, void>;
  deleteObject: (
    filePath: string,
    throwIfNoExists?: boolean,
  ) => TE.TaskEither<FSError, void>;
}

export const GetFSClient = (ctx: GetFSClientContext): FSClient => {
  const objectExists: FSClient["objectExists"] = (filePath) => {
    return TE.fromIOEither(
      fp.IOE.tryCatch(() => {
        const filePathDir = path.dirname(filePath);
        const tempFolderExists = ctx.client.existsSync(filePathDir);
        if (!tempFolderExists) {
          fsLogger.debug.log(
            "Folder %s does not exist, creating...",
            filePathDir,
          );
          ctx.client.mkdirSync(filePathDir, { recursive: true });
        }

        const statsExists = ctx.client.existsSync(filePath);
        // fsLogger.debug.log(
        //   "Network file path %s exists? %s",
        //   path.relative(process.cwd(), filePath),
        //   statsExists,
        // );
        return statsExists;
      }, toFSError),
    );
  };

  const getObject: FSClient["getObject"] = (filePath) => {
    // fsLogger.debug.log("Getting object from path %s", filePath);
    return pipe(
      fp.IOE.tryCatch(
        () => ctx.client.readFileSync(filePath, "utf-8"),
        toFSError,
      ),
      fp.TE.fromIOEither,
    );
  };

  const writeObject: FSClient["writeObject"] = (filePath, data) => {
    fsLogger.debug.log("Writing at %s: %d chars", filePath, data.length);
    return pipe(
      TE.fromIOEither(
        fp.IOE.tryCatch(() => {
          ctx.client.writeFileSync(filePath, data, "utf-8");
        }, toFSError),
      ),
    );
  };

  return {
    _fs: ctx.client,
    resolve: (p) => path.resolve(process.cwd(), p),
    objectExists,
    writeObject,
    getObject,
    deleteObject: (filePath, throwIfNoExists) => {
      fsLogger.debug.log("Deleting object at path %s", filePath);
      return pipe(
        objectExists(filePath),
        TE.chain((exists) => {
          if (exists) {
            return TE.fromIO(() => {
              ctx.client.rmSync(filePath);
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
  };
};
