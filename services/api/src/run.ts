import { logger } from "@econnessione/core";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
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
        serverLogger.error.log(
          "An error occured during server startup %O",
          err
        );
        return () => Promise.reject(err);
      },
      ({ ctx, app }) => () => {
        const server = app.listen(ctx.env.API_PORT, () =>
          ctx.logger.info.log("Server is listening at 4010")
        );

        process.on("disconnect", () => {
          // eslint-disable-next-line no-console
          console.log("closing server...");
          server.close();
        });
        return Promise.resolve(undefined);
      }
    )
  )();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
  // eslint-disable-next-line
  .then((r) => console.log(r))
  // eslint-disable-next-line
  .catch((e) => console.error(e));
