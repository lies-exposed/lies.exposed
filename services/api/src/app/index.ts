import * as path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import cors from "cors";
import express from "express";
import proxy from "express-http-proxy";
import { expressjwt as jwt } from "express-jwt";
import { unless } from "express-unless";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { createFromTGMessage } from "#flows/tg/createFromTGMessage.flow.js";
import { actorCommand } from "#providers/tg/actor.command.js";
import { areaCommand } from "#providers/tg/area.command.js";
import { groupCommand } from "#providers/tg/group.command.js";
import { helpCommand } from "#providers/tg/help.command.js";
import { loginCommand } from "#providers/tg/login.command.js";
import { startCommand } from "#providers/tg/start.command.js";
import { AddRoutes } from "#routes/index.js";
import { type RouteContext } from "#routes/route.types.js";
import { MakeUploadFileRoute } from "#routes/uploads/uploadFile.controller.js";
import { GetWriteJSON } from "#utils/json.utils.js";
import { getThanksMessage } from "#utils/tg.utils.js";

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

  // const mediaPath = path.resolve(__dirname, "../data");
  // app.use(express.static(mediaPath));
  const tgLogger = ctx.logger.extend("tg-bot"); // bind /start command to tg bot

  // bind /login $email $token command to tg bot
  loginCommand(ctx);
  // bind /start command to tg bot
  startCommand(ctx);
  // bind /help command to tg bot
  helpCommand(ctx);
  // bind /actor command to tg bot
  actorCommand(ctx);
  // bind /group command to tg bot
  groupCommand(ctx);
  // bind /area command to tg bot
  areaCommand(ctx);

  ctx.tg.onMessage((msg, metadata) => {
    if (msg.text?.startsWith("/")) {
      ctx.logger.debug.log("Command message %s, skipping...", msg.text);
      return;
    }

    void pipe(
      sequenceS(fp.TE.ApplicativePar)({
        storeMsg: GetWriteJSON(ctx.logger)(
          path.resolve(
            ctx.config.dirs.cwd,
            `temp/tg/messages/${msg.message_id}.json`,
          ),
        )(msg),
        eventSuggestion: createFromTGMessage({ ...ctx, logger: tgLogger })(
          msg,
          metadata,
        ),
      }),
      fp.TE.map(({ eventSuggestion }) => {
        tgLogger.info.log("Success %O", eventSuggestion);
        return getThanksMessage(eventSuggestion, ctx.env.WEB_URL);
      }),
      throwTE,
    )
      .then((message) =>
        ctx.tg.api.sendMessage(msg.chat.id, message, {
          reply_to_message_id: msg.message_id,
        }),
      )
      .catch((e) => {
        tgLogger.error.log("Error %O", e);
      });
  });

  app.use("/v1", AddRoutes(express.Router(), ctx));

  app.use(
    "/openai",
    cors(ctx.config.cors),
    proxy("localai.liexp.dev:8080/v1", {
      proxyReqOptDecorator: (req: any) => {
        const proxyReq = {
          ...req,
          headers: {
            ...req.headers,
            "Access-Control-Allow-Origin": "*",
            // connection: "keep-alive",
          },
        };
        ctx.logger.debug.log("Proxy request %O", proxyReq);
        return Promise.resolve(proxyReq);
      },
      proxyResOptDecorator: (proxyRes: any) => {
        ctx.logger.debug.log("Proxy response %O", proxyRes);
        return Promise.resolve(proxyRes);
      },
      timeout: 120 * 1000,
    }),
  );
  app.use(function (err: any, req: any, res: any, next: any) {
    // eslint-disable-next-line no-console
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
