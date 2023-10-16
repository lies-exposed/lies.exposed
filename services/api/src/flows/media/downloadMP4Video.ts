import fs from "fs";
import path from "path";
import { taskifyStream } from "@liexp/shared/lib/utils/task.utils";
import axios from "axios";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type SimpleMedia } from './thumbnails/extractMP4Thumbnail';
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";



export const downloadMP4Video: TEFlow<[SimpleMedia, string], string> = (ctx) => (media, tempFolder) => {
  const tempVideoFilePath = path.resolve(tempFolder, `${media.id}.mp4`);

  if (fs.existsSync(tempVideoFilePath)) {
    return TE.right(tempVideoFilePath);
  }

  return pipe(
    TE.tryCatch(() => {
      ctx.logger.debug.log("Getting mp4 from %s", media.location);
      return axios.get(media.location, {
        responseType: "stream",
      });
    }, toControllerError),
    TE.chain((stream) => {
      const tempVideoFile = fs.createWriteStream(tempVideoFilePath);

      return pipe(
        taskifyStream(stream.data, tempVideoFile),
        TE.mapLeft(toControllerError),
        TE.map(() => tempVideoFilePath)
      );
    })
  );
};
