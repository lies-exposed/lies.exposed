import { fp } from "@liexp/core/lib/fp/index.js";
import cors from "cors";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
import { unless } from "express-unless";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { AddRoutes } from "#routes/index.js";
import { type RouteContext } from "#routes/route.types.js";
import { MakeUploadFileRoute } from "#routes/uploads/uploadFile.controller.js";

export const makeApp = (ctx: RouteContext): express.Express => {
  const app = express();

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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
        { url: /openai\/*/ },
      ],
    }),
  );

  app.use("/v1", AddRoutes(express.Router(), ctx));

  // app.use("/openai", cors(ctx.config.cors), (req, res, next) => {
  //   void pipe(
  //     getLangchainProviderFlow(ctx),
  //     fp.TE.map(({ localAiProxyUrl }) =>
  //       proxy(localAiProxyUrl, {
  //         proxyReqOptDecorator: (req: any) => {
  //           const proxyReq = {
  //             ...req,
  //             headers: {
  //               ...req.headers,
  //               "Access-Control-Allow-Origin": "*",
  //               // connection: "keep-alive",
  //             },
  //           };
  //           ctx.logger.debug.log("Proxy request %O", proxyReq);
  //           return Promise.resolve(proxyReq);
  //         },
  //         proxyResOptDecorator: (proxyRes: any) => {
  //           ctx.logger.debug.log("Proxy response %O", proxyRes);
  //           return Promise.resolve(proxyRes);
  //         },
  //         timeout: 120 * 1000,
  //       })(req, res, next),
  //     ),
  //   )();
  // });

  app.use(function (err: any, req: any, res: any, next: any) {
    try {
      ctx.logger.error.log(
        "An error occurred during %s %s %O",
        req.method,
        req.url,
        err,
      );
      if (err) {
        if (err.name === "UnauthorizedError") {
          return res.status(err.status).send(err);
        }

        if (err.name === "DBError") {
          return res.status(500).send({
            name: "APIError",
            message: err.message,
            details: [...err.details.meta],
          });
        }

        if (err.details?.kind === "DecodingError") {
          const errors = PathReporter.report(fp.E.left(err.details.errors));
          ctx.logger.error.log(`DecodingError %O`, errors);
          return res.status(400).send({
            name: "DecodingError",
            details: errors,
          });
        }

        ctx.logger.debug.log("An error occurred %O", err);
        ctx.logger.debug.log("Error kind %s", err.details.kind);
        if (err.details.kind === "ServerError") {
          if (err.details.meta.kind === "DecodingError") {
            const errors = PathReporter.report(
              fp.E.left(err.details.meta.errors),
            );
            ctx.logger.error.log(`An error occurred %O`, errors);
            return res.status(500).send({
              ...err,
              name: "APIError",
              details: ["DecodingError", errors],
            });
          }
        }

        if (err.name === "APIError") {
          ctx.logger.error.log("APIError %O", JSON.stringify(err, null, 2));
          return res.status(err.status).send({
            name: "APIError",
            message: err.message,
            details: err.details,
          });
        }
      }
      return res.status(err.status ?? 500).send(err);
    } catch (e) {
      ctx.logger.error.log(
        `An error occurred during %s %s: %O`,
        req.method,
        req.url,
        JSON.stringify(err, null, 2),
      );
      return res.status(500).send(err);
    }
  });

  return app;
};
