import { loadENV } from "@liexp/core/lib/env/utils.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { makeApp } from "./app/index.js";
import { loadContext } from "./context/load.js";
import * as ControllerError from "#io/ControllerError.js";

const run = (): Promise<void> => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

  const serverLogger = logger.GetLogger("api");

  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env.local");
    loadENV(process.cwd(), ".env");

    D.enable(process.env.DEBUG ?? "*");
  }

  return pipe(
    TE.Do,
    TE.apS("ctx", loadContext("server")),
    TE.bind("app", ({ ctx }) => TE.right(makeApp(ctx))),
    TE.mapLeft(ControllerError.report),
    TE.chain(({ ctx, app }) => {
      // TODO: handle properly a possible error thrown by mkdirSync
      [
        ...Object.values(ctx.config.dirs.config),
        ...Object.values(ctx.config.dirs.temp),
      ].forEach((folder) => {
        ctx.fs._fs.mkdirSync(folder, { recursive: true });
      });

      const server = app.listen(
        ctx.env.SERVER_PORT,
        ctx.env.SERVER_HOST,
        () => {
          ctx.logger.info.log(
            `Server is listening ${ctx.env.SERVER_HOST}:${ctx.env.SERVER_PORT}`,
          );
        },
      );

      process.on("beforeExit", () => {
        serverLogger.debug.log("closing server...");
        server.close();

        void ctx.db
          .close()()
          .then((e) => {
            process.exit(e._tag === "Right" ? 0 : 1);
          });
      });

      server.on("error", (e) => {
        serverLogger.error.log("An error occurred %O", e);
        process.exit(1);
      });

      return fp.TE.right(undefined);
    }),
    throwTE,
  );
};

run().catch((e) => {
  // eslint-disable-next-line
  console.error(e);
  process.exit(1);
});
