import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sequenceT } from "fp-ts/lib/Apply.js";
import Cron from "node-cron";
import {
  cleanUpFolder,
  cleanUpTempMedia,
} from "#flows/media/cleanUpTempFolder.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const cleanTempFolder = (ctx: RouteContext): Cron.ScheduledTask =>
  Cron.schedule(
    ctx.env.TEMP_FOLDER_CLEAN_UP_CRON,
    (opts) => {
      const olderThan = 30 * 24;
      void pipe(
        sequenceT(fp.RTE.ApplicativePar)(
          cleanUpTempMedia(olderThan),
          cleanUpFolder(ctx.config.dirs.temp.root, olderThan),
        )(ctx),
        throwTE,
      ).catch((err) => {
        ctx.logger.error.log(`Clean up temp folder error %O`, err);
      });
    },
    { name: "TEMP_FOLDER_CLEAN_UP" },
  );
