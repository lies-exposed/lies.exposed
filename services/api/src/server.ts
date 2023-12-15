import * as path from "path";
import { MakeURLMetadata } from "@liexp/backend/lib/providers/URLMetadata.provider";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg.provider";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider";
import { IGProvider } from "@liexp/backend/lib/providers/ig/ig.provider";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider";
import { TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider";
import * as logger from "@liexp/core/lib/logger";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as axios from "axios";
import cors from "cors";
import * as ExifReader from "exifreader";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
import { unless } from "express-unless";
import ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import metadataParser from "page-metadata-parser";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import wk from "wikipedia";
import { actorCommand } from "./providers/tg/actor.command";
import { areaCommand } from "./providers/tg/area.command";
import { groupCommand } from "./providers/tg/group.command";
import { helpCommand } from "./providers/tg/help.command";
import { startCommand } from "./providers/tg/start.command";
import { AddRoutes } from "./routes";
import { createFromTGMessage } from "@flows/tg/createFromTGMessage.flow";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { type ENV } from "@io/ENV";
import { createS3Provider } from "@providers/context/s3.context";
import { EventsConfig } from "@queries/config";
import { type RouteContext } from "@routes/route.types";
import { MakeUploadFileRoute } from "@routes/uploads/uploadFile.controller";
import { getDataSource } from "@utils/data-source";
import { GetWriteJSON } from "@utils/json.utils";
import { getThanksMessage } from "@utils/tg.utils";

// var whitelist = ["http://localhost:8002"]
const corsOptions: cors.CorsOptions = {
  origin: true,
};

export const makeContext = (
  env: ENV,
): TE.TaskEither<ControllerError, RouteContext> => {
  const serverLogger = logger.GetLogger("server");

  const db = pipe(
    getDataSource(env, false),
    TE.chain(source => GetTypeORMClient(source)),
    TE.mapLeft(toControllerError),
  );

  const wpProvider = WikipediaProvider({
    logger: logger.GetLogger("mw"),
    client: wk,
  });

  const fsClient = GetFSClient();

  const jwtClient = GetJWTProvider({
    secret: env.JWT_SECRET,
    logger: serverLogger,
  });

  const urlMetadataClient = MakeURLMetadata({
    client: axios.default.create({}),
    parser: {
      getMetadata: metadataParser.getMetadata,
    },
  });
  return pipe(
    sequenceS(TE.ApplicativePar)({
      logger: TE.right(serverLogger),
      db,
      s3: TE.right(createS3Provider(env)),
      fs: TE.right(fsClient),
      jwt: TE.right(jwtClient),
      urlMetadata: TE.right(urlMetadataClient),
      env: TE.right(env),
      tg: pipe(
        TGBotProvider(
          { logger: serverLogger },
          {
            token: env.TG_BOT_TOKEN,
            chat: env.TG_BOT_CHAT,
            polling: env.TG_BOT_POLLING,
            baseApiUrl: env.TG_BOT_BASE_API_URL,
          },
        ),
        TE.right,
      ),
      puppeteer: TE.right(GetPuppeteerProvider(puppeteer, {})),
      ffmpeg: TE.right(GetFFMPEGProvider(ffmpeg)),
      http: TE.right(HTTPProvider(axios.default.create({}))),
      geo: TE.right(
        GeocodeProvider({
          http: HTTPProvider(
            axios.default.create({ baseURL: env.GEO_CODE_BASE_URL }),
          ),
        }),
      ),
      wp: TE.right(wpProvider),
      ig: TE.right(
        IGProvider({
          logger: logger.GetLogger("ig"),
          credentials: { username: env.IG_USERNAME, password: env.IG_PASSWORD },
        }),
      ),
      imgProc: TE.right(
        MakeImgProcClient({
          logger: logger.GetLogger("imgproc"),
          client: sharp.bind(sharp),
          exifR: ExifReader,
        }),
      ),
      config: TE.right({
        events: EventsConfig,
        dirs: {
          cwd: process.cwd(),
          temp: {
            root: path.resolve(process.cwd(), "temp"),
            media: path.resolve(process.cwd(), "temp/media"),
          },
        },
      }),
    }),
    TE.mapLeft((e) => ({
      ...e,
      name: e.name,
      status: 500,
    })),
  );
};

export const makeApp = (ctx: RouteContext): express.Express => {
  const app = express();

  app.use(cors(corsOptions) as any);
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
      ],
    }),
  );

  // const mediaPath = path.resolve(__dirname, "../data");
  // app.use(express.static(mediaPath));

  const tgLogger = ctx.logger.extend("tg-bot"); // bind /start command to tg bot

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
      sequenceS(TE.ApplicativePar)({
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
      TE.map(({ eventSuggestion }) => {
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
          const errors = PathReporter.report(E.left(err.details.errors));
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
            const errors = PathReporter.report(E.left(err.details.meta.errors));
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
