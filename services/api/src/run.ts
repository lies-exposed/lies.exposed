/* eslint-disable import/first */
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("module-alias")(path.resolve(__dirname, "../"));
import * as logger from "@liexp/core/logger";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { failure } from "io-ts/lib/PathReporter";
import { makeApp, makeContext } from "./server";

export const run = (): Promise<void> => {
  const serverLogger = logger.GetLogger("api");

  return pipe(
    makeContext(process.env),
    TE.map((ctx) => ({
      app: makeApp(ctx),
      ctx: ctx,
    })),
    TE.fold(
      (err) => {
        const parsedError =
          err.details.kind === "DecodingError"
            ? failure(err.details.errors)
            : (err.details.meta as any[]) ?? [];
        serverLogger.error.log(
          "%s\n %O \n\n %O",
          err.name,
          err.message,
          parsedError
        );
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
          // const downloadVaccineDataTask = Cron.schedule(
          //   ctx.env.DOWNLOAD_VACCINE_DATA_CRON,
          //   () => {
          //     serverLogger.info.log("Start vaccine data download task...");
          //     // eslint-disable-next-line @typescript-eslint/no-floating-promises
          //     runDownload()()
          //       .then(() => runParse())
          //       .then(() => runAggregate())
          //       .catch((e) => {
          //         serverLogger.error.log(
          //           "An error occured during vaccine data download task: %O",
          //           e
          //         );
          //       });
          //   }
          // );
          // ctx.logger.debug.log('Setup "download vaccine data task" (%s)', ctx.env.DOWNLOAD_VACCINE_DATA_CRON);

          const server = app.listen(ctx.env.API_PORT, () =>
            ctx.logger.info.log(`Server is listening ${ctx.env.API_PORT}`)
          );

          process.on("SIGINT", () => {
            // eslint-disable-next-line no-console
            serverLogger.debug.log(
              "Removing vaccine data download cron task..."
            );
            // downloadVaccineDataTask.stop();
            // eslint-disable-next-line no-console
            serverLogger.debug.log("closing server...");
            server.close();
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
        }
    )
  )();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
  // eslint-disable-next-line
  .catch((e) => console.error(e));
