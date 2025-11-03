import { loadENV } from "@liexp/core/lib/env/utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import cors from "cors";
import D from "debug";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
import { unless } from "express-unless";
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

      // JWT authentication middleware
      // Exclude healthcheck endpoint from authentication
      const jwtMiddleware = jwt({
        secret: ctx.env.JWT_SECRET,
        algorithms: ["HS256"],
      });
      jwtMiddleware.unless = unless;
      app.use(
        jwtMiddleware.unless({
          path: [{ url: "/v1/healthcheck", method: "GET" }],
        }),
      );

      // Routes
      app.use("/v1", createRoutes(ctx));

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

      process.on("beforeExit", () => {
        serverLogger.debug.log("closing server...");
        server.close();
      });

      server.on("error", (e) => {
        serverLogger.error.log("An error occurred %O", e);
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
