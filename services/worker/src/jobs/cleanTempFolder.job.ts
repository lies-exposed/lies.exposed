import { cleanUpFolder } from "@liexp/backend/lib/flows/fs/cleanUpFolder.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sequenceT } from "fp-ts/lib/Apply.js";
import Cron, { type ScheduledTask } from "node-cron";
import { type WorkerContext } from "#context/context.js";
import { cleanUpTempMediaFolder } from "#flows/fs/cleanUpTempMediaFolder.flow.js";

export const cleanTempFolder = (ctx: WorkerContext): ScheduledTask =>
  Cron.schedule(
    ctx.env.TEMP_FOLDER_CLEAN_UP_CRON,
    (_opts) => {
      const olderThan = 30 * 24;
      void pipe(
        sequenceT(fp.RTE.ApplicativePar)(
          cleanUpTempMediaFolder(olderThan),
          cleanUpFolder(ctx.config.dirs.temp.root, olderThan),
        )(ctx),
        throwTE,
      ).catch((err) => {
        ctx.logger.error.log(`Clean up temp folder error %O`, err);
      });
    },
    { name: "TEMP_FOLDER_CLEAN_UP" },
  );
