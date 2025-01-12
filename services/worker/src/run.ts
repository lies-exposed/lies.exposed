import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Redis } from "ioredis";
import { CronJobs } from "./jobs/jobs.js";
import { WorkerSubscribers } from "./services/subscribers/WorkerSubscribers.js";
import { loadContext } from "#context/load.js";
import { toWorkerError } from "#io/worker.error.js";
import { TGMessageCommands } from "#providers/tg/index.js";

const run = (): Promise<void> => {
  return pipe(
    TE.Do,
    TE.bind("ctx", () => loadContext()),
    TE.bind("redis", ({ ctx }) => {
      return TE.tryCatch(async () => {
        const redis = new Redis(6379, ctx.env.REDIS_HOST, {
          lazyConnect: true,
        });

        if (ctx.env.REDIS_CONNECT) {
          await redis.connect();
        }
        return redis;
      }, toWorkerError);
    }),
    TE.bind("subscribers", ({ ctx, redis }) =>
      WorkerSubscribers({ ...ctx, redis, logger: ctx.logger.extend("sub") }),
    ),
    TE.chain(({ ctx, redis }) => {
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

        redis.disconnect();

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
