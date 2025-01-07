import { cleanUpFolder } from "@liexp/backend/lib/flows/fs/cleanUpFolder.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { toControllerError } from "../../../io/ControllerError.js";
import { type TEReader } from "../../flow.types.js";

export const cleanUpTempMediaFolder =
  (time: number): TEReader<void> =>
  (ctx) => {
    return pipe(
      cleanUpFolder(ctx.config.dirs.temp.media, time),
      fp.RTE.mapLeft(toControllerError),
    )(ctx);
  };
