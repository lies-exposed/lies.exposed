/* eslint-disable import/order, import/first */
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { parseENV } from "#utils/env.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { failure } from "io-ts/lib/PathReporter.js";
import { postOnSocialJob } from "./jobs/socialPostScheduler.job.js";
import { makeApp } from "./app/index.js";
import { makeContext } from "./context/index.js";
import { cleanTempFolder } from "./jobs/cleanTempFolder.job.js";
import D from 'debug';
const run = (): Promise<void> => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

  const serverLogger = logger.GetLogger("api");

  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env", true);
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
    TE.fold(
      (err) => {
        serverLogger.error.log("%s\n %s \n\n %O", err.name, err.message, err);
        const parsedError =
          err.details.kind === "DecodingError"
            ? err.details.errors
              ? failure(err.details.errors as any[])
              : []
            : (err.details.meta as any[]) ?? [];
        serverLogger.error.log("Parsed error %O", parsedError);
        return () =>
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({
            name: err.name,
            message: err.message,
            details: parsedError,
          });
      },
      ({ ctx, app }) =>
        () => {
          // cron jobs
          const postOnSocialTask = postOnSocialJob(ctx);
          const cleanTempFolderTask = cleanTempFolder(ctx);
          postOnSocialTask.start();
          cleanTempFolderTask.start();

          const server = app.listen(ctx.env.API_PORT, () => {
            ctx.logger.info.log(`Server is listening ${ctx.env.API_PORT}`);
          });

          process.on("SIGINT", () => {
            // eslint-disable-next-line no-console
            // serverLogger.debug.log(
            //   "Removing vaccine data download cron task..."
            // );
            // downloadVaccineDataTask.stop();
            serverLogger.debug.log(`Removing "post on social" cron task...`);
            postOnSocialTask.stop();
            serverLogger.debug.log(
              `Removing "clean up temp folder" cron task...`,
            );
            cleanTempFolderTask.stop();

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
                  serverLogger.error.log(
                    `TG Bot error during polling stop %O`,
                    e,
                  );
                },
              );

            void ctx.db
              .close()()
              .then((e) => {
                process.exit(e._tag === "Right" ? 0 : 1);
              });
          });

          server.on("error", (e) => {
            serverLogger.error.log("An error occured %O", e);
          });

          return Promise.resolve(undefined);
        },
    ),
  )();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
  // eslint-disable-next-line
  .catch((e) => console.error(e));
