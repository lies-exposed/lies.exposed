import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { CronJobs } from "./jobs/jobs.js";
import { WorkerSubscribers } from "./services/subscribers/WorkerSubscribers.js";
import { loadContext } from "#context/load.js";
import { TGMessageCommands } from "#providers/tg/index.js";

const run = (): Promise<void> => {
  return pipe(
    TE.Do,
    TE.bind("ctx", () => loadContext()),
    TE.bind("subscribers", ({ ctx }) =>
      WorkerSubscribers({ ...ctx, logger: ctx.logger.extend("sub") }),
    ),
    TE.bind("cronJobs", ({ ctx }) => {
      return pipe(
        CronJobs(ctx),
        TE.right,
        TE.chainFirst((cronJobs) => cronJobs.onBootstrap()),
      );
    }),
    TE.chain(({ ctx, cronJobs }) => {
      // cron jobs

      ctx.tg.api.on("polling_error", (e) => {
        ctx.logger.error.log(`TG Bot error during polling %O`, e);
      });

      TGMessageCommands(ctx);

      process.on("beforeExit", () => {
        // serverLogger.debug.log(
        //   "Removing vaccine data download cron task..."
        // );
        // downloadVaccineDataTask.stop();
        cronJobs.onShutdown();

        ctx.redis.client.disconnect();

        void pipe(
          sequenceS(TE.ApplicativePar)({
            tg: ctx.tg.stopPolling({}),
            cronJobs: cronJobs.onShutdown(),
          }),
          throwTE,
        );
      });

      return TE.right(undefined);
    }),
    throwTE,
  );
};

run().catch((e) => {
  // eslint-disable-next-line
  console.error(e);
  process.exit(1);
});
