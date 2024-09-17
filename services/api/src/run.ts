/* eslint-disable import/order, import/first */
import { parseENV } from "#utils/env.utils.js";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import D from "debug";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { CronJobs } from "./jobs/jobs.js";
import { makeApp } from "./app/index.js";
import { makeContext } from "./context/index.js";
import ControllerError from "#io/ControllerError.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";

const run = (): Promise<void> => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

  const serverLogger = logger.GetLogger("api");

  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env");
    loadENV(process.cwd(), ".env.local", true);

    D.enable(process.env.DEBUG ?? "*");
  }

  return pipe(
    parseENV(process.env),
    TE.fromEither,
    TE.chain(makeContext),
    TE.map((ctx) => ({
      app: makeApp(ctx),
      ctx,
    })),
    TE.mapLeft(ControllerError.report),
    TE.chain(({ ctx, app }) => {
      // cron jobs
      const cronJobs = CronJobs(ctx);

      const server = app.listen(
        ctx.env.SERVER_PORT,
        ctx.env.SERVER_HOST,
        () => {
          ctx.logger.info.log(
            `Server is listening ${ctx.env.SERVER_HOST}:${ctx.env.SERVER_PORT}`,
          );

          cronJobs.onBootstrap();

          ctx.tg.api.on("polling_error", (e) => {
            serverLogger.error.log(`TG Bot error during polling %O`, e);
          });
        },
      );

      process.on("beforeExit", () => {
        // eslint-disable-next-line no-console
        // serverLogger.debug.log(
        //   "Removing vaccine data download cron task..."
        // );
        // downloadVaccineDataTask.stop();
        cronJobs.onShutdown();

        // eslint-disable-next-line no-console
        serverLogger.debug.log("closing server...");
        server.close();

        void ctx.tg
          .stopPolling({})()
          // eslint-disable-next-line no-console
          .then(
            (b) => {
              serverLogger.debug.log(`TG bot polling stop`);
            },
            (e) => {
              serverLogger.error.log(`TG Bot error during polling stop %O`, e);
            },
          );

        void ctx.db
          .close()()
          .then((e) => {
            process.exit(e._tag === "Right" ? 0 : 1);
          });
      });

      server.on("error", (e) => {
        serverLogger.error.log("An error occurred %O", e);
        cronJobs.onShutdown();
        process.exit(1);
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
