import { loadENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import cors from "cors";
import D from "debug";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { makeAgentContext } from "#context/load.js";
import { createRoutes } from "#routes/index.js";

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
      const app = express();

      // Middleware
      app.use(cors());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // Authentication is handled per-route using authenticationHandler middleware
      // This allows for fine-grained permission control and supports both User and ServiceClient tokens

      // Routes
      app.use("/v1", createRoutes(ctx));

      app.use(
        (err: Error, _req: Request, res: Response, _next: NextFunction) => {
          serverLogger.error.log("Express error: %O", err);
          res.status(500).json({
            error: "Internal server error",
            message: err.message,
            details: "details" in err ? err.details : undefined,
          });
        },
      );

      return TE.right(app);
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
