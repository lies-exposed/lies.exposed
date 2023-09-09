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
import { S3Client } from "@liexp/backend/lib/providers/space";
import { TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider";
import * as logger from "@liexp/core/lib/logger";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import axios from "axios";
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
import { createFromTGMessage } from "@flows/event-suggestion/createFromTGMessage.flow";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { type ENV } from "@io/ENV";
import { MakeProjectImageRoutes } from "@routes/ProjectImages/ProjectImage.routes";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { MakeAdminRoutes } from "@routes/admin/admin.routes";
import { MakeAreasRoutes } from "@routes/areas/Areas.routes";
import { MakeDeathEventsRoutes } from "@routes/events/deaths/death.routes";
import { MakeDocumentaryReleaseRoutes } from "@routes/events/documentary/documentary.routes";
import { MakeEventRoutes } from "@routes/events/event.routes";
import { MakePatentEventsRoutes } from "@routes/events/patents/patent.routes";
import { MakeQuoteRoutes } from "@routes/events/quotes/quote.routes";
import { MakeScientificStudyRoutes } from "@routes/events/scientific-study/ScientificStudyRoute.route";
import { MakeTransactionEventsRoutes } from "@routes/events/transactions/transaction.routes";
import { MakeGraphsRoutes } from "@routes/graphs/graphs.routes";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { MakeGroupMemberRoutes } from "@routes/groups-members/GroupMember.route";
import { MakeHealthcheckRoutes } from "@routes/healthcheck/healthcheck.routes";
import { MakeKeywordRoutes } from "@routes/keywords/keywords.routes";
import { MakeLinkRoutes } from "@routes/links/LinkRoute.route";
import { MakeMediaRoutes } from "@routes/media/media.routes";
import { MakeNetworksRoutes } from "@routes/networks/networks.routes";
import { MakeOpenGraphRoutes } from "@routes/open-graph/openGraph.routes";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { type RouteContext } from "@routes/route.types";
import { MakeSocialPostRoutes } from "@routes/social-posts/socialPost.routes";
import { MakeStatsRoutes } from "@routes/stats/stats.routes";
import { MakeStoriesRoutes } from "@routes/stories/stories.route";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
import { MakeUploadFileRoute } from "@routes/uploads/uploadFile.controller";
import { MakeUserRoutes } from "@routes/users/User.routes";
import { getDataSource } from "@utils/data-source";
import { GetWriteJSON } from "@utils/json.utils";


// var whitelist = ["http://localhost:8002"]
const corsOptions: cors.CorsOptions = {
  origin: true,
};

export const makeContext = (
  env: ENV,
): TE.TaskEither<ControllerError, RouteContext> => {
  const serverLogger = logger.GetLogger("server");

  const db = pipe(
    GetTypeORMClient(getDataSource(env, false)),
    TE.mapLeft(toControllerError),
  );

  const s3 =
    env.NODE_ENV === "development" || env.NODE_ENV === "test"
      ? S3Client.GetS3Client({
          endpoint: env.DEV_DATA_HOST,
          credentials: {
            accessKeyId: env.SPACE_ACCESS_KEY_ID,
            secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
          },
          tls: true,
          forcePathStyle: true,
        })
      : S3Client.GetS3Client({
          endpoint: `https://${env.SPACE_REGION}.${env.SPACE_ENDPOINT}`,
          region: env.SPACE_REGION,
          credentials: {
            accessKeyId: env.SPACE_ACCESS_KEY_ID,
            secretAccessKey: env.SPACE_ACCESS_KEY_SECRET,
          },
          tls: true,
        });

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
    client: axios,
    parser: {
      getMetadata: metadataParser.getMetadata,
    },
  });
  return pipe(
    sequenceS(TE.ApplicativePar)({
      logger: TE.right(serverLogger),
      db,
      s3: TE.right(s3),
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
      http: TE.right(HTTPProvider({})),
      geo: TE.right(
        GeocodeProvider({
          http: HTTPProvider({ baseURL: env.GEO_CODE_BASE_URL }),
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

  const router = express.Router();

  // healthcheck
  MakeHealthcheckRoutes(router, ctx);

  // users
  MakeUserRoutes(router, ctx);

  // pages
  MakePageRoutes(router, ctx);

  // groups
  MakeGroupRoutes(router, ctx);
  MakeGroupMemberRoutes(router, ctx);

  // actors
  MakeActorRoutes(router, ctx);

  // areas
  MakeAreasRoutes(router, ctx);

  // projects
  MakeProjectRoutes(router, ctx);

  // project images
  MakeProjectImageRoutes(router, ctx);

  // stories
  MakeStoriesRoutes(router, ctx);

  // media
  MakeMediaRoutes(router, ctx);

  // events
  MakeEventRoutes(router, ctx);
  MakeDeathEventsRoutes(router, ctx);
  MakeScientificStudyRoutes(router, ctx);
  MakePatentEventsRoutes(router, ctx);
  MakeDocumentaryReleaseRoutes(router, ctx);
  MakeTransactionEventsRoutes(router, ctx);
  MakeQuoteRoutes(router, ctx);

  // links
  MakeLinkRoutes(router, ctx);
  MakeKeywordRoutes(router, ctx);

  // graphs data
  MakeGraphsRoutes(router, ctx);

  // open graphs
  MakeOpenGraphRoutes(router, ctx);

  // stats
  MakeStatsRoutes(router, ctx);

  // networks
  MakeNetworksRoutes(router, ctx);

  // uploads
  MakeUploadsRoutes(router, ctx);

  // admin
  MakeAdminRoutes(router, ctx);
  // social posts
  MakeSocialPostRoutes(router, ctx);

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
            process.cwd(),
            `temp/tg/messages/${msg.message_id}.json`,
          ),
        )(msg),
        eventSuggestion: createFromTGMessage({ ...ctx, logger: tgLogger })(
          msg,
          metadata,
        ),
      }),
      TE.map(({ eventSuggestion, storeMsg }) => {
        tgLogger.info.log("Success %O", eventSuggestion);
        const message = [
          "Thanks for your contribution! 🫶",
          "\n",
          `Links: ${
            eventSuggestion.link
              ? eventSuggestion.link.map(
                  (l) => `${ctx.env.WEB_URL}/links/${l.id}\n`,
                )
              : ""
          }`,
          `Photos: ${
            eventSuggestion.photos.length > 0
              ? eventSuggestion.photos.map(
                  (m) => `${ctx.env.WEB_URL}/media/${m.id}\n`,
                )
              : ""
          }`,
          eventSuggestion.videos.length > 0
            ? `Areas: ${eventSuggestion.videos.map(
                (m) => `${ctx.env.WEB_URL}/media/${m.id}\n`,
              )}`
            : null,
          eventSuggestion.videos.length > 0
            ? `Videos: ${eventSuggestion.videos.map(
                (m) => `${ctx.env.WEB_URL}/media/${m.id}\n`,
              )}`
            : null,
        ];
        return message.filter((m) => !!m).join("\n");
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

  app.use("/v1", router);

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
