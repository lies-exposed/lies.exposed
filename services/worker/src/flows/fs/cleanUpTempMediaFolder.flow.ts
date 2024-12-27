import { cleanUpFolder } from "@liexp/backend/lib/flows/fs/cleanUpFolder.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type RTE } from "../../types.js";
import { toWorkerError } from "#io/worker.error.js";

export const cleanUpTempMediaFolder =
  (time: number): RTE<void> =>
  (ctx) => {
    return pipe(
      cleanUpFolder(ctx.config.dirs.temp.media, time),
      fp.RTE.mapLeft(toWorkerError),
    )(ctx);
  };
