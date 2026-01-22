import { loadENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import * as TE from "fp-ts/lib/TaskEither.js";
import { makeApp } from "./app/make.js";
import { makeAgentContext } from "#context/load.js";

const run = (): Promise<void> => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

  const serverLogger = logger.GetLogger("agent");

  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env.local");
    loadENV(process.cwd(), ".env");

    D.enable(process.env.DEBUG ?? "*");
  }

  return pipe(
    TE.Do,
    TE.apS("ctx", makeAgentContext("agent-service")),
    TE.bind("app", ({ ctx }) => {
      return TE.right(makeApp(ctx));
    }),
    TE.chain(({ ctx, app }) => {
      const server = app.listen(
        ctx.env.SERVER_PORT,
        ctx.env.SERVER_HOST,
        () => {
          ctx.logger.info.log(
            `Agent service is listening ${ctx.env.SERVER_HOST}:${ctx.env.SERVER_PORT}`,
          );
        },
      );

      process.on("beforeExit", (code) => {
        if (code) {
          serverLogger.error.log("Server closed with error code:", code);
        }
        serverLogger.debug.log("closing server...");
        server.close();
      });

      server.on("error", (e) => {
        serverLogger.error.log("An error occurred %O", e);
        if ("details" in e) {
          serverLogger.error.log(
            "Error details: %O",
            JSON.stringify(e.details),
          );
        }
        process.exit(1);
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
