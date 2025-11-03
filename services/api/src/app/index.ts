import cors from "cors";
import express from "express";
import { unless } from "express-unless";
import { MakeMCPRoutes } from "../routes/mcp/index.js";
import { errorHandler } from "./error.middleware.js";
import { type ServerContext } from "#context/context.type.js";
import { AddRoutes } from "#routes/index.js";
import { MakeUploadFileRoute } from "#routes/uploads/uploadFile.controller.js";

export const makeApp = (ctx: ServerContext): express.Express => {
  const app = express();

  app.set("query parser", "extended");

  app.use(cors(ctx.config.cors));
  // uploads
  MakeUploadFileRoute(app, ctx);

  const jsonMiddleware: any = express.json({ limit: 1024 * 1000 });
  jsonMiddleware.unless = unless;
  app.use(
    jsonMiddleware.unless({
      path: [{ url: /\/v1\/uploads-multipart\/*/, method: "PUT" }],
    }),
  );

  // Authentication is handled per-route using authenticationHandler middleware
  // This allows for fine-grained permission control and supports both User and ServiceClient tokens

  app.use("/v1", AddRoutes(express.Router(), ctx));

  MakeMCPRoutes(app, ctx);

  app.use(errorHandler(ctx));

  return app;
};
