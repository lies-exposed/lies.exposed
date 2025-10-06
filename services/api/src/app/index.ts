import cors from "cors";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
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

  app.use(
    jwt({ secret: ctx.env.JWT_SECRET, algorithms: ["HS256"] }).unless({
      path: [
        { url: "/v1/links/submit", method: "POST" },
        { url: "/v1/users/login", method: "POST" },
        { url: "/v1/users/signup", method: "POST" },
        { url: /\/v1\/*/, method: "GET" },
        { url: /\/v1\/uploads*\//, method: "PUT" },
        { url: "/v1/events/suggestions", method: "POST" },
        { url: /\/v1\/events\/suggestions*\//, method: "PUT" },
        { url: /\/media\/*/ },
        ...(ctx.env.NODE_ENV === "development" ? [{ url: /\/mcp\/*/ }] : []),
      ],
    }),
  );

  app.use("/v1", AddRoutes(express.Router(), ctx));

  MakeMCPRoutes(app, ctx);

  app.use(errorHandler(ctx));

  return app;
};
