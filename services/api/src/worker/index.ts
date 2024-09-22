/* eslint-disable import/order, import/first */
import ControllerError from "#io/ControllerError.js";
import { TGMessageCommands } from "#providers/tg/index.js";
import { parseENV } from "#utils/env.utils.js";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { makeContext } from "../context/index.js";
import { CronJobs } from "./jobs/jobs.js";

const run = (): Promise<void> => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

  const workerLogger = logger.GetLogger("worker");

  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env.local");
    loadENV(process.cwd(), ".env");
  }

  D.enable(process.env.DEBUG ?? "*");

  return pipe(
    parseENV(process.env),
    TE.fromEither,
    TE.chain(makeContext),
    TE.mapLeft(ControllerError.report),
    TE.chain((ctx) => {
      ctx.logger = workerLogger;
      // cron jobs
      const cronJobs = CronJobs(ctx);

      ctx.tg.api.on("polling_error", (e) => {
        ctx.logger.error.log(`TG Bot error during polling %O`, e);
      });

      TGMessageCommands(ctx);

      process.on("beforeExit", () => {
        // eslint-disable-next-line no-console
        // serverLogger.debug.log(
        //   "Removing vaccine data download cron task..."
        // );
        // downloadVaccineDataTask.stop();
        cronJobs.onShutdown();

        void ctx.tg
          .stopPolling({})()
          // eslint-disable-next-line no-console
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

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run().catch((e) => {
  // eslint-disable-next-line
  console.error(e);
  process.exit(1);
});
