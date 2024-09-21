import fs from "fs";
import path from "path";
import { type Readable } from "stream";
import { taskifyStream } from "@liexp/backend/lib/utils/task.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type SimpleMP4Media } from "./thumbnails/extractMP4Thumbnail.flow.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const downloadMP4Video: TEFlow<[SimpleMP4Media, string], string> =
  (ctx) => (media, tempFolder) => {
    const tempVideoFilePath = path.resolve(tempFolder, `${media.id}.mp4`);

    if (fs.existsSync(tempVideoFilePath)) {
      return TE.right(tempVideoFilePath);
    }
    ctx.logger.debug.log("Getting mp4 from %s", media.location);
    return pipe(
      ctx.http.get<Readable>(media.location, {
        responseType: "stream",
      }),
      TE.mapLeft(toControllerError),
      TE.chain((stream) => {
        const tempVideoFile = fs.createWriteStream(tempVideoFilePath);

        return pipe(
          taskifyStream(stream, tempVideoFile),
          TE.mapLeft(toControllerError),
          TE.map(() => tempVideoFilePath),
        );
      }),
    );
  };
