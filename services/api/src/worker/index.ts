import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Redis } from "ioredis";
import { CronJobs } from "./jobs/jobs.js";
import { WorkerSubscribers } from "./subscribers/WorkerSubscribers.js";
import { loadContext } from "#context/load.js";
import { toControllerError } from "#io/ControllerError.js";
import { TGMessageCommands } from "#providers/tg/index.js";

const run = (): Promise<void> => {
  const workerLogger = logger.GetLogger("worker");

  return pipe(
    TE.Do,
    TE.bind("ctx", () => loadContext("worker")),
    TE.bind("redis", () => {
      return TE.tryCatch(async () => {
        const redis = new Redis(6379, "redis.liexp.dev", {
          lazyConnect: true,
        });
        await redis.connect();
        return redis;
      }, toControllerError);
    }),
    TE.bind("subscribers", ({ ctx, redis }) =>
      WorkerSubscribers({ ...ctx, redis, logger: workerLogger.extend("sub") }),
    ),
    TE.chain(({ ctx }) => {
      ctx.logger = workerLogger;
      // cron jobs
      const cronJobs = CronJobs(ctx);

      cronJobs.onBootstrap();

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

        void ctx.tg
          .stopPolling({})()

          .then(
            (b) => {
              ctx.logger.debug.log(`TG bot polling stop`);
            },
            (e) => {
              ctx.logger.error.log(`TG Bot error during polling stop %O`, e);
            },
          );

        void ctx.db
          .close()()
          .then((e) => {
            process.exit(e._tag === "Right" ? 0 : 1);
          });
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
