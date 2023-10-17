import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { sequenceT } from "fp-ts/Apply";
import { pipe } from "fp-ts/function";
import Cron from "node-cron";
import {
  cleanUpFolder,
  cleanUpTempMedia,
} from "@flows/media/cleanUpTempFolder.flow";
import { type RouteContext } from "@routes/route.types";

export const cleanTempFolder = (ctx: RouteContext): Cron.ScheduledTask =>
  Cron.schedule(ctx.env.TEMP_FOLDER_CLEAN_UP_CRON, (opts) => {
    const olderThan = 30 * 24;
    void pipe(
      sequenceT(fp.TE.ApplicativePar)(
        cleanUpTempMedia(ctx)(olderThan),
        cleanUpFolder(ctx)(ctx.config.dirs.temp.root, olderThan),
      ),
      throwTE,
    ).catch((err) => {
      ctx.logger.error.log(`Clean up temp folder error %O`, err);
    });
  });
