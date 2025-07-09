import fs from "fs";
import path from "path";
import { type Readable } from "stream";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  toHTTPError,
  type HTTPError,
} from "@liexp/shared/lib/providers/http/http.provider.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { taskifyStream } from "../../utils/task.utils.js";

export const downloadMP4Video =
  <
    C extends LoggerContext & FSClientContext & HTTPProviderContext,
    M extends { id: UUID; location: string },
  >(
    media: M,
    tempFolder: string,
  ): ReaderTaskEither<C, HTTPError, string> =>
  (ctx) => {
    const tempVideoFilePath = path.resolve(tempFolder, `${media.id}.mp4`);

    ctx.logger.debug.log("Getting mp4 from %s", media.location);

    if (ctx.fs._fs.existsSync(tempVideoFilePath)) {
      ctx.logger.debug.log("File exists already, skipping download...");
      return TE.right(tempVideoFilePath);
    }

    ctx.logger.debug.log("Start file downloading...");

    return pipe(
      ctx.http.get<Readable>(media.location, {
        responseType: "stream",
      }),
      TE.chain((stream) => {
        const tempVideoFile = fs.createWriteStream(tempVideoFilePath);

        return pipe(
          taskifyStream(stream, tempVideoFile),
          TE.map(() => tempVideoFilePath),
          TE.mapLeft(toHTTPError),
        );
      }),
    );
  };
